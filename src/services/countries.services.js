const axios = require('axios');

const COUNTRIES_API_URL = process.env.COUNTRIES_API_URL || 'https://restcountries.com/v2/all?fields=name,capital,region,population,flag,currencies';

const API_TIMEOUT = 10000; // 10 seconds

/**
 * Fetch all countries from REST Countries API
 * @returns {Promise<Array>} - Array of country objects
 * @throws {Error} - If API request fails
 */
const fetchAllCountries = async () => {
    try {
        console.log('Fetching countries from REST Countries API...');
        
        const response = await axios.get(COUNTRIES_API_URL, {
            timeout: API_TIMEOUT,
            headers: {
                'Accept': 'application/json',
            }
        });

        if (!response.data || !Array.isArray(response.data)) {
            throw new Error('Invalid response format from countries API');
        }

        console.log(`✓ Successfully fetched ${response.data.length} countries`);
        return response.data;

    } catch (error) {
        if (error.code === 'ECONNABORTED') {
            console.error('✗ Countries API request timed out');
            throw new Error('Countries API request timed out');
        }

        if (error.response) {
            // API responded with error status
            console.error(`✗ Countries API error: ${error.response.status} - ${error.response.statusText}`);
            throw new Error(`Countries API returned ${error.response.status}`);
        }

        if (error.request) {
            // Request made but no response received
            console.error('✗ No response from Countries API');
            throw new Error('Could not reach Countries API');
        }

        // Other errors
        console.error('✗ Error fetching countries:', error.message);
        throw new Error('Failed to fetch countries data');
    }
};

/**
 * Extract currency information from a country object
 * Returns the first currency if multiple exist
 * @param {Object} country - Country object from API
 * @returns {Object|null} - { code, name, symbol } or null
 */
const extractCurrency = (country) => {
    if (!country.currencies || !Array.isArray(country.currencies) || country.currencies.length === 0) {
        return null;
    }

    const firstCurrency = country.currencies[0];
    return {
        code: firstCurrency.code || null,
        name: firstCurrency.name || null,
        symbol: firstCurrency.symbol || null
    };
};

module.exports = {
    fetchAllCountries,
    extractCurrency,
};