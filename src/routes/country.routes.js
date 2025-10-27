const express = require('express');

const { 
    refreshCountries, 
    getAllCountries, 
    getCountryByName, 
    deleteCountry,
    getImage 
} = require('../controllers/country.controllers');
const { getStatus } = require('../controllers/status.controllers');
const { 
    validateCountryName, 
    validateQueryParams, 
    validateRefresh,
    sanitizeParams 
} = require('../middlewares/validation.middleware');
const { asyncHandler } = require('../middlewares/errorHandler.middlewares');

const countryRouter = express.Router();

/**
 * @route   POST /countries/refresh
 * @desc    Fetch and refresh all countries data from external APIs
 * @access  Public
*/
countryRouter.post('/refresh', validateRefresh, asyncHandler(refreshCountries));

/**
 * @route   GET /countries
 * @desc    Get all countries with optional filtering and sorting
 * @query   region - Filter by region (e.g., Africa, Europe)
 * @query   currency - Filter by currency code (e.g., NGN, USD)
 * @query   sort - Sort results (gdp_desc, gdp_asc, population_desc, etc.)
 * @access  Public
*/
countryRouter.get('/', sanitizeParams, validateQueryParams, asyncHandler(getAllCountries));

/**
 * @route   GET /countries/image
 * @desc    Get the generated summary image
 * @access  Public
 * @note    This must come BEFORE /:name route to avoid conflict
*/
countryRouter.get('/image', asyncHandler(getImage));

/**
 * @route   GET /countries/:name
 * @desc    Get a single country by name
 * @param   name - Country name (case-insensitive)
 * @access  Public
*/
countryRouter.get('/:name', sanitizeParams, validateCountryName, asyncHandler(getCountryByName));

/**
 * @route   DELETE /countries/:name
 * @desc    Delete a country by name
 * @param   name - Country name (case-insensitive)
 * @access  Public
*/
countryRouter.delete('/:name', sanitizeParams, validateCountryName, asyncHandler(deleteCountry));

/**
 * @route   GET /status
 * @desc    Get database status (total countries and last refresh time)
 * @access  Public
*/
countryRouter.get('/status', asyncHandler(getStatus));

module.exports = countryRouter;