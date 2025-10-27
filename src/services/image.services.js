const { createCanvas } = require('canvas');
const fs = require('fs').promises;
const path = require('path');

// Image configuration
const IMAGE_WIDTH = 800;
const IMAGE_HEIGHT = 600;
const CACHE_DIR = path.join(__dirname, '../../cache');
const IMAGE_PATH = path.join(CACHE_DIR, 'summary.png');

/**
 * Ensure cache directory exists
 * Creates directory if it doesn't exist
 */
const ensureCacheDirectory = async () => {
    try {
        await fs.access(CACHE_DIR);
    } catch {
        await fs.mkdir(CACHE_DIR, { recursive: true });
        console.log('✓ Cache directory created');
    }
};

/**
 * Format number with commas for readability
 * @param {Number} num - Number to format
 * @returns {String} - Formatted number
 */
const formatNumber = (num) => {
    if (num === null || num === undefined) return 'N/A';
    return num.toLocaleString('en-US', { maximumFractionDigits: 2 });
};

/**
 * Format date to readable string
 * @param {Date} date - Date object
 * @returns {String} - Formatted date
 */
const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'UTC'
    });
};

/**
 * Generate summary image with country statistics
 * @param {Number} totalCount - Total number of countries
 * @param {Array} topCountries - Top 5 countries by GDP
 * @param {Date} timestamp - Last refresh timestamp
 * @returns {Promise<String>} - Path to generated image
 */
const generateSummaryImage = async (totalCount, topCountries, timestamp) => {
    try {
        console.log('🖼️  Generating summary image...');

        // Ensure cache directory exists
        await ensureCacheDirectory();

        // Create canvas
        const canvas = createCanvas(IMAGE_WIDTH, IMAGE_HEIGHT);
        const ctx = canvas.getContext('2d');

        // Background - gradient
        const gradient = ctx.createLinearGradient(0, 0, 0, IMAGE_HEIGHT);
        gradient.addColorStop(0, '#1e3a8a');  // Dark blue
        gradient.addColorStop(1, '#3b82f6');  // Light blue
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, IMAGE_WIDTH, IMAGE_HEIGHT);

        // Title
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 40px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Country Currency Summary', IMAGE_WIDTH / 2, 60);

        // Subtitle line
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(200, 80);
        ctx.lineTo(600, 80);
        ctx.stroke();

        // Total countries box
        ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.fillRect(50, 110, IMAGE_WIDTH - 100, 60);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'left';
        ctx.fillText(`Total Countries: ${formatNumber(totalCount)}`, 70, 145);

        // Top 5 Countries header
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 28px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Top 5 Countries by Estimated GDP', IMAGE_WIDTH / 2, 220);

        // Table headers
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.fillRect(50, 240, IMAGE_WIDTH - 100, 40);
        
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 18px Arial';
        ctx.textAlign = 'left';
        ctx.fillText('Rank', 70, 265);
        ctx.fillText('Country', 140, 265);
        ctx.fillText('Estimated GDP', 400, 265);
        ctx.fillText('Region', 580, 265);

        // Top 5 countries data
        let yPosition = 295;
        topCountries.forEach((country, index) => {
            // Alternating row colors
            if (index % 2 === 0) {
                ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
                ctx.fillRect(50, yPosition - 20, IMAGE_WIDTH - 100, 35);
            }

            ctx.fillStyle = '#ffffff';
            ctx.font = '18px Arial';
            ctx.textAlign = 'left';
            
            // Rank
            ctx.fillText(`${index + 1}`, 80, yPosition);
            
            // Country name (truncate if too long)
            const countryName = country.name.length > 20 
                ? country.name.substring(0, 17) + '...' 
                : country.name;
            ctx.fillText(countryName, 140, yPosition);
            
            // GDP
            ctx.fillText(`$${formatNumber(country.estimated_gdp)}`, 400, yPosition);
            
            // Region (truncate if too long)
            const region = country.region && country.region.length > 15
                ? country.region.substring(0, 12) + '...'
                : country.region || 'N/A';
            ctx.fillText(region, 580, yPosition);

            yPosition += 35;
        });

        // Footer - timestamp
        ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.fillRect(50, IMAGE_HEIGHT - 70, IMAGE_WIDTH - 100, 50);
        
        ctx.fillStyle = '#ffffff';
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`Last Updated: ${formatDate(timestamp)}`, IMAGE_WIDTH / 2, IMAGE_HEIGHT - 38);

        // Save image
        const buffer = canvas.toBuffer('image/png');
        await fs.writeFile(IMAGE_PATH, buffer);

        console.log(`✓ Summary image generated: ${IMAGE_PATH}`);
        return IMAGE_PATH;

    } catch (error) {
        console.error('✗ Error generating image:', error.message);
        throw new Error('Failed to generate summary image');
    }
};

/**
 * Check if summary image exists
 * @returns {Promise<Boolean>} - True if image exists
 */
const imageExists = async () => {
    try {
        await fs.access(IMAGE_PATH);
        return true;
    } catch {
        return false;
    }
};

/**
 * Get path to summary image
 * @returns {String} - Absolute path to image
 */
const getImagePath = () => {
    return IMAGE_PATH;
};

/**
 * Delete summary image
 * Useful for testing or cleanup
 * @returns {Promise<Boolean>} - True if deleted
 */
const deleteImage = async () => {
    try {
        await fs.unlink(IMAGE_PATH);
        console.log('✓ Summary image deleted');
        return true;
    } catch (error) {
        if (error.code === 'ENOENT') {
            return false; // File didn't exist
        }
        throw error;
    }
};

module.exports = {
    generateSummaryImage,
    imageExists,
    getImagePath,
    deleteImage,
};