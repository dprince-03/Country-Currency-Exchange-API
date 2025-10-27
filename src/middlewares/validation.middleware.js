const { isEmpty } = require('../utils/helpers.utils');

/**
 * Validate country name parameter
 * Used for GET /countries/:name and DELETE /countries/:name
 */
const validateCountryName = (req, res, next) => {
    const { name } = req.params;

    if (isEmpty(name)) {
        return res.status(400).json({
            error: 'Validation failed',
            details: {
                name: 'Country name is required'
            }
        });
    }

    // Name should be reasonable length
    if (name.length > 100) {
        return res.status(400).json({
            error: 'Validation failed',
            details: {
                name: 'Country name is too long (max 100 characters)'
            }
        });
    }

    next();
};

/**
 * Validate query parameters for GET /countries
 * Ensures valid values for filters and sorting
 */
const validateQueryParams = (req, res, next) => {
    const { region, currency, sort } = req.query;
    const errors = {};

    // Validate region if provided
    if (region !== undefined) {
        if (typeof region !== 'string' || isEmpty(region)) {
            errors.region = 'Region must be a non-empty string';
        } else if (region.length > 50) {
            errors.region = 'Region is too long (max 50 characters)';
        }
    }

    // Validate currency if provided
    if (currency !== undefined) {
        if (typeof currency !== 'string' || isEmpty(currency)) {
            errors.currency = 'Currency must be a non-empty string';
        } else if (currency.length !== 3) {
            errors.currency = 'Currency code must be exactly 3 characters (e.g., NGN, USD)';
        }
    }

    // Validate sort if provided
    if (sort !== undefined) {
        const validSorts = [
            'gdp_desc', 'gdp_asc',
            'population_desc', 'population_asc',
            'name_asc', 'name_desc'
        ];
        
        if (typeof sort !== 'string' || !validSorts.includes(sort.toLowerCase())) {
            errors.sort = `Sort must be one of: ${validSorts.join(', ')}`;
        }
    }

    // If there are validation errors, return 400
    if (Object.keys(errors).length > 0) {
        return res.status(400).json({
            error: 'Validation failed',
            details: errors
        });
    }

    next();
};

/**
 * Validate refresh request
 * No body needed, just ensure method is POST
 */
const validateRefresh = (req, res, next) => {
    // Refresh endpoint doesn't require any input validation
    // Just proceed to controller
    next();
};

/**
 * General request body validator
 * Checks if content-type is JSON when body is expected
 */
const validateContentType = (req, res, next) => {
    // Only validate for POST, PUT, PATCH requests
    if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
        const contentType = req.get('Content-Type');
        
        // Allow requests with no body
        if (!req.body || Object.keys(req.body).length === 0) {
            return next();
        }

        // If body exists, ensure it's JSON
        if (contentType && !contentType.includes('application/json')) {
            return res.status(400).json({
                error: 'Validation failed',
                details: {
                    contentType: 'Content-Type must be application/json'
                }
            });
        }
    }
    
    next();
};

/**
 * Sanitize and normalize request parameters
 * Trims whitespace and normalizes case where appropriate
 */
const sanitizeParams = (req, res, next) => {
    // Sanitize path parameters
    if (req.params.name) {
        req.params.name = req.params.name.trim();
    }

    // Sanitize query parameters
    if (req.query.region) {
        req.query.region = req.query.region.trim();
    }

    if (req.query.currency) {
        req.query.currency = req.query.currency.trim().toUpperCase();
    }

    if (req.query.sort) {
        req.query.sort = req.query.sort.trim().toLowerCase();
    }

    next();
};

module.exports = {
    validateCountryName,
    validateQueryParams,
    validateRefresh,
    validateContentType,
    sanitizeParams,
};