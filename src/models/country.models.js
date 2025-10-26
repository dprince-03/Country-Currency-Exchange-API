const { query, transaction } = require("../config/database.config");

/**
 * Insert or update multiple countries in bulk
 * Uses INSERT ... ON DUPLICATE KEY UPDATE for upsert logic
 * @param {Array} countries - Array of country objects
 * @returns {Promise<Object>} - { inserted, updated }
*/
const upsertCountries = async (countries) => {
    if (!countries || countries.length === 0) {
        return { inserted: 0, updated: 0 };
    }

    const sql = `
        INSERT INTO countries (
            name, capital, region, population, 
            currency_code, exchange_rate, estimated_gdp, 
            flag_url, last_refreshed_at
        ) VALUES ?
        ON DUPLICATE KEY UPDATE
            capital = VALUES(capital),
            region = VALUES(region),
            population = VALUES(population),
            currency_code = VALUES(currency_code),
            exchange_rate = VALUES(exchange_rate),
            estimated_gdp = VALUES(estimated_gdp),
            flag_url = VALUES(flag_url),
            last_refreshed_at = VALUES(last_refreshed_at)
    `;

    const values = countries.map(country => [
        country.name,
        country.capital || null,
        country.region || null,
        country.population,
        country.currency_code || null,
        country.exchange_rate || null,
        country.estimated_gdp || null,
        country.flag_url || null,
        country.last_refreshed_at || new Date(),
    ]);

    try {
        const result = await query(sql, [values]);

        // affectedRows = 1 means INSERT, 2 means UPDATE
        const inserted = result.affectedRows - result.changedRows;
        const updated = result.changedRows;

        return {
            inserted,
            updated,
            total: countries.length,
        };
    } catch (error) {
        console.error(`Error upserting countries: ${error.message}`);
        throw error;
    };
};

/**
 * Get all countries with optional filtering and sorting
 * @param {Object} filters - { region, currency }
 * @param {String} sort - Sorting option (gdp_desc, gdp_asc, population_desc, population_asc, name_asc, name_desc)
 * @returns {Promise<Array>} - Array of country objects
*/
const getAllCountries = async (filters = {}, sort = null) => {
    let sql = 'SELECT * FROM countries WHERE 1=1';
    const params = [];

    // Add region filter
    if (filters.region) {
        sql += ' AND region = ?';
        params.push(filters.region);
    }

    // Add currency filter
    if (filters.currency) {
        sql += ' AND currency_code = ?';
        params.push(filters.currency);
    }

    // Add sorting
    if (sort) {
        switch (sort.toLowerCase()) {
            case 'gdp_desc':
                sql += ' ORDER BY estimated_gdp DESC';
                break;
            case 'gdp_asc':
                sql += ' ORDER BY estimated_gdp ASC';
                break;
            case 'population_desc':
                sql += ' ORDER BY population DESC';
                break;
            case 'population_asc':
                sql += ' ORDER BY population ASC';
                break;
            case 'name_asc':
                sql += ' ORDER BY name ASC';
                break;
            case 'name_desc':
                sql += ' ORDER BY name DESC';
                break;
            default:
                sql += ' ORDER BY id ASC';
        }
    } else {
        sql += ' ORDER BY id ASC';
    }

    try {
        const countries = await query(sql, params);
        return countries;
    } catch (error) {
        console.error('Error fetching countries:', error.message);
        throw error;
    };
};

/**
 * Get a single country by name (case-insensitive)
 * @param {String} name - Country name
 * @returns {Promise<Object|null>} - Country object or null
*/
const getCountryByName = async (name) => {
    const sql = 'SELECT * FROM countries WHERE LOWER(name) = LOWER(?) LIMIT 1';
    
    try {
        const countries = await query(sql, [name]);
        return countries.length > 0 ? countries[0] : null;
    } catch (error) {
        console.error('Error fetching country by name:', error.message);
        throw error;
    };
};

/**
 * Delete a country by name (case-insensitive)
 * @param {String} name - Country name
 * @returns {Promise<Boolean>} - True if deleted, false if not found
*/
const deleteCountryByName = async (name) => {
    const sql = 'DELETE FROM countries WHERE LOWER(name) = LOWER(?)';
    
    try {
        const result = await query(sql, [name]);
        return result.affectedRows > 0;
    } catch (error) {
        console.error('Error deleting country:', error.message);
        throw error;
    };
};

/**
 * Get database status (total countries and last refresh timestamp)
 * @returns {Promise<Object>} - { total_countries, last_refreshed_at }
*/
const getStatus = async () => {
    const countSql = 'SELECT COUNT(*) as total FROM countries';
    const timestampSql = 'SELECT MAX(last_refreshed_at) as last_refresh FROM countries';
    
    try {
        const [countResult] = await query(countSql);
        const [timestampResult] = await query(timestampSql);
        
        return {
            total_countries: countResult.total,
            last_refreshed_at: timestampResult.last_refresh || null
        };
    } catch (error) {
        console.error('Error fetching status:', error.message);
        throw error;
    };
};

/**
 * Get top N countries by estimated GDP
 * @param {Number} limit - Number of countries to return (default: 5)
 * @returns {Promise<Array>} - Array of top countries
*/
const getTopCountriesByGDP = async (limit = 5) => {
    const sql = `
        SELECT name, estimated_gdp, region, population 
        FROM countries 
        WHERE estimated_gdp IS NOT NULL 
        ORDER BY estimated_gdp DESC 
        LIMIT ?
    `;
    
    try {
        const countries = await query(sql, [limit]);
        return countries;
    } catch (error) {
        console.error('Error fetching top countries:', error.message);
        throw error;
    };
};

/**
 * Check if any countries exist in the database
 * @returns {Promise<Boolean>} - True if countries exist
*/
const hasCountries = async () => {
    const sql = 'SELECT COUNT(*) as total FROM countries LIMIT 1';
    
    try {
        const [result] = await query(sql);
        return result.total > 0;
    } catch (error) {
        console.error('Error checking countries existence:', error.message);
        throw error;
    };
};

/**
 * Get distinct regions from the database
 * Useful for validation or providing filter options
 * @returns {Promise<Array>} - Array of region names
*/
const getDistinctRegions = async () => {
    const sql = 'SELECT DISTINCT region FROM countries WHERE region IS NOT NULL ORDER BY region';
    
    try {
        const regions = await query(sql);
        return regions.map(r => r.region);
    } catch (error) {
        console.error('Error fetching regions:', error.message);
        throw error;
    };
};

/**
 * Get distinct currencies from the database
 * Useful for validation or providing filter options
 * @returns {Promise<Array>} - Array of currency codes
*/
const getDistinctCurrencies = async () => {
    const sql = 'SELECT DISTINCT currency_code FROM countries WHERE currency_code IS NOT NULL ORDER BY currency_code';
    
    try {
        const currencies = await query(sql);
        return currencies.map(c => c.currency_code);
    } catch (error) {
        console.error('Error fetching currencies:', error.message);
        throw error;
    };
};

module.exports = {
    upsertCountries,
    getAllCountries,
    getCountryByName,
    deleteCountryByName,
    getStatus,
    getTopCountriesByGDP,
    hasCountries,
    getDistinctRegions,
    getDistinctCurrencies,
};