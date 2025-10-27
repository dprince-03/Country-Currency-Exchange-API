const countryModel = require('../models/country.models');

/**
 * GET /status
 * Get database status (total countries and last refresh timestamp)
 */
const getStatus = async (req, res, next) => {
    try {
        // Fetch status from database
        const status = await countryModel.getStatus();

        // Return status
        return res.status(200).json({
            total_countries: status.total_countries,
            last_refreshed_at: status.last_refreshed_at
        });

    } catch (error) {
        console.error('✗ Error fetching status:', error.message);
        next(error);
    }
};

module.exports = {
    getStatus,
};