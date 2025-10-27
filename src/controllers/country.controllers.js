const { fetchAllCountries } = require('../services/countries.services');
const { fetchExchangeRates } = require('../services/exchange.services');
const { transformCountries, validateTransformedData } = require('../services/dataTransformer.services');
const { generateSummaryImage, imageExists, getImagePath } = require('../services/image.services');
const countryModel = require('../models/country.models');
const { parseQueryParams, errorResponse, successResponse, isEmpty } = require('../utils/helpers.utils');

/**
 * POST /countries/refresh
 * Fetch countries and exchange rates, transform data, and save to database
 */
const refreshCountries = async (req, res, next) => {
    try {
        console.log('\n Starting country data refresh...');

        // Fetch data from both APIs concurrently
        const [countriesData, exchangeRates] = await Promise.all([
            fetchAllCountries(),
            fetchExchangeRates()
        ]).catch(error => {
            // If either API fails, return 503
            return res.status(503).json(errorResponse(
                'External data source unavailable',
                error.message
            ));
        });

        // Transform the data
        const transformedCountries = transformCountries(countriesData, exchangeRates);

        // Validate transformed data
        const { valid, invalid } = validateTransformedData(transformedCountries);

        if (valid.length === 0) {
            return res.status(400).json(errorResponse(
                'No valid country data to process',
                `${invalid.length} countries failed validation`
            ));
        }

        // Save to database
        const result = await countryModel.upsertCountries(valid);

        console.log(`✓ Database updated: ${result.inserted} inserted, ${result.updated} updated`);

        // Generate summary image
        try {
            const topCountries = await countryModel.getTopCountriesByGDP(5);
            const status = await countryModel.getStatus();
            
            await generateSummaryImage(
                status.total_countries,
                topCountries,
                status.last_refreshed_at
            );
        } catch (imageError) {
            // Don't fail the refresh if image generation fails
            console.warn('  Image generation failed:', imageError.message);
        }

        // Return success response
        return res.status(200).json(successResponse(
            {
                inserted: result.inserted,
                updated: result.updated,
                total: result.total,
                failed: invalid.length
            },
            'Countries data refreshed successfully'
        ));

    } catch (error) {
        console.error('✗ Error in refresh controller:', error.message);
        next(error);
    }
};

/**
 * GET /countries
 * Get all countries with optional filtering and sorting
 */
const getAllCountries = async (req, res, next) => {
    try {
        // Parse query parameters
        const { filters, sort } = parseQueryParams(req.query);

        // Fetch countries from database
        const countries = await countryModel.getAllCountries(filters, sort);

        // Return results
        return res.status(200).json(countries);

    } catch (error) {
        console.error('✗ Error fetching countries:', error.message);
        next(error);
    }
};

/**
 * GET /countries/:name
 * Get a single country by name
 */
const getCountryByName = async (req, res, next) => {
    try {
        const { name } = req.params;

        // Validate name parameter
        if (isEmpty(name)) {
            return res.status(400).json(errorResponse('Country name is required'));
        }

        // Fetch country from database
        const country = await countryModel.getCountryByName(name);

        if (!country) {
            return res.status(404).json(errorResponse('Country not found'));
        }

        return res.status(200).json(country);

    } catch (error) {
        console.error('✗ Error fetching country:', error.message);
        next(error);
    }
};

/**
 * DELETE /countries/:name
 * Delete a country by name
 */
const deleteCountry = async (req, res, next) => {
    try {
        const { name } = req.params;

        // Validate name parameter
        if (isEmpty(name)) {
            return res.status(400).json(errorResponse('Country name is required'));
        }

        // Delete from database
        const deleted = await countryModel.deleteCountryByName(name);

        if (!deleted) {
            return res.status(404).json(errorResponse('Country not found'));
        }

        return res.status(200).json(successResponse(
            null,
            `Country "${name}" deleted successfully`
        ));

    } catch (error) {
        console.error('✗ Error deleting country:', error.message);
        next(error);
    }
};

/**
 * GET /countries/image
 * Serve the generated summary image
 */
const getImage = async (req, res, next) => {
    try {
        // Check if image exists
        const exists = await imageExists();

        if (!exists) {
            return res.status(404).json(errorResponse('Summary image not found'));
        }

        // Serve the image file
        const imagePath = getImagePath();
        return res.sendFile(imagePath);

    } catch (error) {
        console.error('✗ Error serving image:', error.message);
        next(error);
    }
};

module.exports = {
    refreshCountries,
    getAllCountries,
    getCountryByName,
    deleteCountry,
    getImage,
};