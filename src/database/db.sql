CREATE DATABASE IF NOT EXISTS country_currency_db;

USE country_currency_db;

DROP TABLE IF EXISTS countries;

CREATE TABLE countries(
    id INT AUTO_INCREAMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    capital VARCHAR(100),
    region VARCHAR(50),
    populatiion BIGINT NOT NULL,
    currency_code VARCHAR(10),
    exchange_rate DECIMAL(15, 6),
    estimate_gdp DECIMAL(10, 2),
    flag_url VARCHAR(255),
    last_refreshed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Indexes for faster queries
    INDEX idx_region (region),
    INDEX idx_currency (currency_code),
    INDEX idx_name (name),
    INDEX idx_gdp (estimated_gdp)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DESCRIBE countries;