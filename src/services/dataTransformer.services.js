const { extractCurrency } = require('./countries.services');
const { getExchangeRate } = require('./exchange.services');

/**
 * Generate a random GDP multiplier between 1000 and 2000
 * @returns {Number} - Random number between 1000 and 2000
 */
const generateRandomMultiplier = () => {
    return Math.floor(Math.random() * (2000 - 1000 + 1)) + 1000;
};

/**
 * Calculate estimated GDP
 * Formula: population × random_multiplier ÷ exchange_rate
 * @param {Number} population - Country population
 * @param {Number} exchangeRate - Currency exchange rate
 * @returns {Number|null} - Calculated GDP or null if inputs invalid
 */
const calculateEstimatedGDP = (population, exchangeRate) => {
    if (!population || !exchangeRate || exchangeRate === 0) {
        return null;
    }

    const multiplier = generateRandomMultiplier();
    const gdp = (population * multiplier) / exchangeRate;
    
    // Round to 2 decimal places
    return Math.round(gdp * 100) / 100;
};

/**
 * Transform raw country data from API into database format
 * Matches currencies with exchange rates and calculates GDP
 * @param {Array} countries - Array of country objects from REST Countries API
 * @param {Object} exchangeRates - Exchange rates object from Exchange API
 * @returns {Array} - Array of transformed country objects ready for database
 */
const transformCountries = (countries, exchangeRates) => {
    if (!countries || !Array.isArray(countries)) {
        throw new Error('Invalid countries data');
    }

    if (!exchangeRates || typeof exchangeRates !== 'object') {
        throw new Error('Invalid exchange rates data');
    }

    console.log(`Transforming ${countries.length} countries...`);

    const transformed = countries.map(country => {
        // Extract first currency
        const currency = extractCurrency(country);
        const currencyCode = currency?.code || null;

        // Get exchange rate for this currency
        const exchangeRate = currencyCode ? getExchangeRate(exchangeRates, currencyCode) : null;

        // Calculate estimated GDP
        const estimatedGDP = (country.population && exchangeRate) 
            ? calculateEstimatedGDP(country.population, exchangeRate)
            : null;

        // Build transformed object
        return {
            name: country.name || 'Unknown',
            capital: country.capital || null,
            region: country.region || null,
            population: country.population || 0,
            currency_code: currencyCode,
            exchange_rate: exchangeRate,
            estimated_gdp: estimatedGDP,
            flag_url: country.flag || null,
            last_refreshed_at: new Date()
        };
    });

    // Log statistics
    const withCurrency = transformed.filter(c => c.currency_code).length;
    const withExchangeRate = transformed.filter(c => c.exchange_rate).length;
    const withGDP = transformed.filter(c => c.estimated_gdp).length;

    console.log(`✓ Transformation complete:`);
    console.log(`  - Countries with currency: ${withCurrency}/${transformed.length}`);
    console.log(`  - Countries with exchange rate: ${withExchangeRate}/${transformed.length}`);
    console.log(`  - Countries with GDP: ${withGDP}/${transformed.length}`);

    return transformed;
};

/**
 * Validate transformed country data before database insertion
 * Ensures required fields are present
 * @param {Array} countries - Transformed countries array
 * @returns {Object} - { valid: [], invalid: [] }
 */
const validateTransformedData = (countries) => {
    const valid = [];
    const invalid = [];

    countries.forEach((country, index) => {
        const errors = [];

        if (!country.name || country.name.trim() === '') {
            errors.push('name is required');
        }

        if (country.population === undefined || country.population === null) {
            errors.push('population is required');
        }

        if (errors.length > 0) {
            invalid.push({ index, country: country.name, errors });
        } else {
            valid.push(country);
        }
    });

    if (invalid.length > 0) {
        console.warn(`⚠️  ${invalid.length} countries failed validation`);
        invalid.forEach(item => {
            console.warn(`  - ${item.country || 'Unknown'}: ${item.errors.join(', ')}`);
        });
    }

    return { valid, invalid };
};

module.exports = {
    transformCountries,
    calculateEstimatedGDP,
    generateRandomMultiplier,
    validateTransformedData,
};