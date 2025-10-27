/**
 * Generate a random number between min and max (inclusive)
 * @param {Number} min - Minimum value
 * @param {Number} max - Maximum value
 * @returns {Number} - Random number
 */
const randomBetween = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

/**
 * Format a date to ISO 8601 string (UTC)
 * @param {Date} date - Date object
 * @returns {String} - ISO formatted date string
 */
const formatISODate = (date = new Date()) => {
    return date.toISOString();
};

/**
 * Sanitize country name for case-insensitive comparison
 * @param {String} name - Country name
 * @returns {String} - Sanitized name
 */
const sanitizeCountryName = (name) => {
    if (!name || typeof name !== 'string') {
        return '';
    }
    return name.trim().toLowerCase();
};

/**
 * Check if a value is a valid positive number
 * @param {*} value - Value to check
 * @returns {Boolean}
 */
const isPositiveNumber = (value) => {
    return typeof value === 'number' && value > 0 && !isNaN(value);
};

/**
 * Build success response object
 * @param {*} data - Response data
 * @param {String} message - Optional success message
 * @returns {Object}
 */
const successResponse = (data, message = null) => {
    const response = { success: true };
    if (message) response.message = message;
    if (data !== undefined) response.data = data;
    return response;
};

/**
 * Build error response object
 * @param {String} error - Error message
 * @param {*} details - Optional error details
 * @returns {Object}
 */
const errorResponse = (error, details = null) => {
    const response = { error };
    if (details) response.details = details;
    return response;
};

/**
 * Validate sorting parameter
 * @param {String} sort - Sort parameter
 * @returns {String|null} - Valid sort value or null
 */
const validateSort = (sort) => {
    const validSorts = [
        'gdp_desc', 'gdp_asc',
        'population_desc', 'population_asc',
        'name_asc', 'name_desc'
    ];
    
    if (!sort || typeof sort !== 'string') {
        return null;
    }
    
    const normalized = sort.toLowerCase();
    return validSorts.includes(normalized) ? normalized : null;
};

/**
 * Sleep/delay utility for testing or rate limiting
 * @param {Number} ms - Milliseconds to sleep
 * @returns {Promise}
 */
const sleep = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * Truncate string to specified length with ellipsis
 * @param {String} str - String to truncate
 * @param {Number} maxLength - Maximum length
 * @returns {String}
 */
const truncate = (str, maxLength = 50) => {
    if (!str || typeof str !== 'string') return '';
    return str.length > maxLength ? str.substring(0, maxLength - 3) + '...' : str;
};

/**
 * Check if string is empty or whitespace only
 * @param {String} str - String to check
 * @returns {Boolean}
 */
const isEmpty = (str) => {
    return !str || (typeof str === 'string' && str.trim().length === 0);
};

/**
 * Parse query parameters for filtering
 * @param {Object} query - Express req.query object
 * @returns {Object} - { filters, sort }
 */
const parseQueryParams = (query) => {
    const filters = {};
    
    if (query.region && typeof query.region === 'string') {
        filters.region = query.region.trim();
    }
    
    if (query.currency && typeof query.currency === 'string') {
        filters.currency = query.currency.trim().toUpperCase();
    }
    
    const sort = validateSort(query.sort);
    
    return { filters, sort };
};

module.exports = {
    randomBetween,
    formatISODate,
    sanitizeCountryName,
    isPositiveNumber,
    successResponse,
    errorResponse,
    validateSort,
    sleep,
    truncate,
    isEmpty,
    parseQueryParams,
};