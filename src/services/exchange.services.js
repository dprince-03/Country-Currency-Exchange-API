const axios = require('axios');

const EXCHANGE_API_URL = process.env.EXCHANGE_API_URL || 
    'https://open.er-api.com/v6/latest/USD';

const API_TIMEOUT = 10000; // 10 seconds

/**
 * Fetch exchange rates from Open Exchange Rates API
 * All rates are relative to USD
 * @returns {Promise<Object>} - Object with currency codes as keys and rates as values
 * @throws {Error} - If API request fails
 */
const fetchExchangeRates = async () => {
    try {
        console.log('Fetching exchange rates from Open Exchange Rates API...');
        
        const response = await axios.get(EXCHANGE_API_URL, {
            timeout: API_TIMEOUT,
            headers: {
                'Accept': 'application/json',
            }
        });

        if (!response.data || !response.data.rates) {
            throw new Error('Invalid response format from exchange rates API');
        }

        const ratesCount = Object.keys(response.data.rates).length;
        console.log(`✓ Successfully fetched ${ratesCount} exchange rates`);
        
        return response.data.rates;

    } catch (error) {
        if (error.code === 'ECONNABORTED') {
            console.error('✗ Exchange rates API request timed out');
            throw new Error('Exchange rates API request timed out');
        }

        if (error.response) {
            // API responded with error status
            console.error(`✗ Exchange rates API error: ${error.response.status} - ${error.response.statusText}`);
            throw new Error(`Exchange rates API returned ${error.response.status}`);
        }

        if (error.request) {
            // Request made but no response received
            console.error('✗ No response from Exchange rates API');
            throw new Error('Could not reach Exchange rates API');
        }

        // Other errors
        console.error('✗ Error fetching exchange rates:', error.message);
        throw new Error('Failed to fetch exchange rates data');
    }
};

/**
 * Get exchange rate for a specific currency code
 * @param {Object} rates - Rates object from API
 * @param {String} currencyCode - Currency code (e.g., 'NGN', 'USD')
 * @returns {Number|null} - Exchange rate or null if not found
 */
const getExchangeRate = (rates, currencyCode) => {
    if (!rates || !currencyCode) {
        return null;
    }

    const rate = rates[currencyCode.toUpperCase()];
    return rate !== undefined ? rate : null;
};

module.exports = {
    fetchExchangeRates,
    getExchangeRate,
};