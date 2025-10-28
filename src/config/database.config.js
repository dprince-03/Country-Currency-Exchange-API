require('dotenv').config();
const mysql = require('mysql2/promise');

const dbconfig = {
	host: process.env.DB_HOST || "localhost",
	user: process.env.DB_USER || "root",
	password: process.env.DB_PASSWORD || "",
	database: process.env.DB_NAME || "country_currency_db",
	port: process.env.DB_PORT || 3306,
	waitForConnections: true,
	connectionLimit: 50,
	maxIdle: 50,
	idleTimeout: 60000,
	queueLimit: 0,
	enableKeepAlive: true,
	keepAliveInitialDelay: 0,
	charset: "utf8mb4",
};

const pool = mysql.createPool(dbconfig);

/**
 * Get a connection from the pool for manual transaction handling
 * Use this when you need explicit control over transactions
 * @returns {Promise<Connection>}
*/
const getConnection = async () => {
    try {
        const connection = await pool.getConnection();
        return connection;
    } catch (error) {
        console.error(`Error getting connection from pool: ${error.message}`);
        throw new Error('Database connection failed');        
    };
};

/**
 * Execute a query using the pool (recommended for most queries)
 * Pool automatically manages connection acquisition and release
 * @param {string} sql - SQL query string
 * @param {Array} params - Query parameters
 * @returns {Promise<Array>}
*/
const query = async (sql, params= []) => {
    try {
        const [rows] = await pool.execute(sql, params);
        return rows;
    } catch (error) {
        console.error(`Database query error: ${error.message}`);
        throw error;
    };
};

/**
 * Test database connection on startup
 * Verifies credentials and database accessibility
 * @returns {Promise<boolean>}
*/
const testConnection = async () => {
    try {
        const connection = await pool.getConnection();
        console.log('✓ Database connected successfully');
        console.log(`✓ Connected to: ${dbconfig.database} at ${dbconfig.host}:${dbconfig.port}`);
        connection.release();
        return true;
    } catch (error) {
        console.error(`✗ Database connection failed: ${error.message}`);
        console.error('✗ Check your .env file and ensure MySQL is running');
        return false;
    };
};

/**
 * Execute queries within a transaction
 * Automatically commits on success, rolls back on error
 * @param {Function} callback - Async function that receives connection
 * @returns {Promise<any>}
*/
const transaction = async (callback) => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        const result = await callback(connection);
        await connection.commit()
        return result;
    } catch (error) {
        await connection.rollback();
        console.error(`Transaction rolled back: ${error.message}`);
        throw error;
    } finally {
        connection.release();
    };
};

/**
 * Gracefully close all connections in the pool
 * Call this during server shutdown
 * @returns {Promise<void>}
*/
const closeConnection = async () => {
    try {
        await pool.end();
        console.log('✓ Database pool closed successfully');
    } catch (error) {
        console.error(`✗ Error closing database pool: ${error.message}`);
        throw error;
    };
};

/**
 * Get pool statistics for monitoring
 * Useful for debugging connection issues
 * @returns {Object}
*/
const getPoolStats = () => {
    return {
        totalConnections: pool.pool._allConnections.length,
        freeConnections: pool.pool._freeConnections.length,
        queuedRequests: pool.pool._connectionQueue.length,
    };
};

module.exports = {
    pool,
    getConnection,
    query,
    testConnection,
    transaction,
    closeConnection,
    getPoolStats,
};