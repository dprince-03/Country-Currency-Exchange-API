/**
 * Global error handling middleware
 * Must be registered LAST in app.js (after all routes)
 * Catches all errors passed via next(error)
 */
const errorHandler = (err, req, res, next) => {
    // Log error for debugging
    console.error('\n Error caught by global handler:');
    console.error(`   URL: ${req.method} ${req.originalUrl}`);
    console.error(`   Message: ${err.message}`);
    if (process.env.NODE_ENV === 'development') {
        console.error(`   Stack: ${err.stack}`);
    }

    // Determine status code
    let statusCode = err.statusCode || err.status || 500;
    
    // If headers already sent, delegate to default Express error handler
    if (res.headersSent) {
        return next(err);
    }

    // Build error response
    const errorResponse = {
        error: err.message || 'Internal server error'
    };

    // Add details for specific error types
    if (err.details) {
        errorResponse.details = err.details;
    }

    // Database errors (don't expose sensitive info)
    if (err.code && err.code.startsWith('ER_')) {
        statusCode = 500;
        errorResponse.error = 'Database error occurred';
        if (process.env.NODE_ENV === 'development') {
            errorResponse.details = err.sqlMessage;
        }
    }

    // Validation errors
    if (err.name === 'ValidationError') {
        statusCode = 400;
        errorResponse.error = 'Validation failed';
        errorResponse.details = err.errors || err.message;
    }

    // External API errors
    if (err.message && (
        err.message.includes('API') || 
        err.message.includes('external') ||
        err.message.includes('timeout')
    )) {
        statusCode = 503;
        errorResponse.error = 'External data source unavailable';
        errorResponse.details = err.message;
    }

    // Send error response
    res.status(statusCode).json(errorResponse);
};

/**
 * 404 Not Found handler
 * Catches requests to undefined routes
 */
const notFoundHandler = (req, res, next) => {
    res.status(404).json({
        error: 'Route not found',
        details: `Cannot ${req.method} ${req.originalUrl}`
    });
};

/**
 * Async route handler wrapper
 * Automatically catches async errors and passes to error handler
 * Usage: router.get('/route', asyncHandler(controllerFunction))
 */
const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};

module.exports = {
    errorHandler,
    notFoundHandler,
    asyncHandler,
};