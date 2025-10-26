# Country Currency Exchange API - Complete Development Guide

## 🎯 Project Overview

You're building a **data aggregation and caching API** that:

- Fetches data from two external APIs (countries + exchange rates)
- Processes and transforms that data (matching currencies, calculating GDP estimates)
- Stores it in MySQL as a cache
- Serves it through RESTful endpoints
- Generates a summary image

Think of it as a **middleman** making external data easier to consume.

---

## 📁 Project Structure

```
country-currency-exchange-api/
│
├── src/
│   ├── config/
│   │   ├── database.js          # MySQL connection pool setup
│   │   └── constants.js         # API URLs, app constants
│   │
│   ├── models/
│   │   └── countryModel.js      # All SQL queries for countries table
│   │
│   ├── services/
│   │   ├── countriesService.js  # Fetch data from restcountries.com
│   │   ├── exchangeService.js   # Fetch rates from open.er-api.com
│   │   ├── dataTransformer.js   # Match currencies, calculate GDP
│   │   └── imageService.js      # Generate summary image
│   │
│   ├── controllers/
│   │   ├── countryController.js # Handle /countries endpoints
│   │   └── statusController.js  # Handle /status endpoint
│   │
│   ├── routes/
│   │   └── countryRoutes.js     # Express route definitions
│   │
│   ├── middleware/
│   │   ├── errorHandler.js      # Global error handling
│   │   └── validator.js         # Request validation
│   │
│   ├── utils/
│   │   ├── logger.js            # Console logging utility
│   │   └── helpers.js           # Random number generation, etc.
│   │
│   └── app.js                   # Express app setup (middleware, routes)
│
├── cache/
│   └── summary.png              # Generated image (created at runtime)
│
├── database/
│   └── schema.sql               # Table creation script
│
├── .env.example                 # Template for environment variables
├── .env                         # Actual config (gitignored)
├── .gitignore                 
├── package.json               
├── server.js                    # Entry point (starts the server)
└── README.md                    # Setup and usage instructions
```

### 🧠 Why This Structure?

**`config/`** - All configuration in one place (database, environment). Single source of truth.

**`models/`** - Your database layer. All SQL queries live here. Controllers call model functions, never write raw SQL in controllers.

**`services/`** - Business logic separated from routes. Each service has ONE job:

- `countriesService` = talk to countries API
- `exchangeService` = talk to exchange API
- `dataTransformer` = combine and transform data
- `imageService` = create the PNG image

**`controllers/`** - Handle HTTP requests/responses. They:

1. Validate input (with middleware help)
2. Call services/models
3. Return formatted responses
4. Don't contain business logic!

**`routes/`** - Define your endpoints. Keep them clean and readable. Just map URLs to controller functions.

**`middleware/`** - Reusable functions that run before your route handlers:

- `errorHandler` - Catches all errors and formats them consistently
- `validator` - Checks request data before it reaches controllers

**`utils/`** - Helper functions that don't fit elsewhere (random number generator, logger).

**`cache/`** - Stores generated images. Not committed to git.

**`database/`** - SQL scripts for setting up tables.

**Separation of `app.js` and `server.js`** - `app.js` sets up Express (routes, middleware). `server.js` starts the server. This makes testing easier.

---

## 📋 Complete Development Checklist

### Phase 1: Project Setup & Foundation ⚙️

#### 1.1 Initialize Project

- [X] Create project directory: `country-currency-exchange-api`
- [X] Run `npm init -y` to create `package.json`
- [X] Create folder structure as shown above
- [X] Initialize git repository: `git init`

#### 1.2 Install Dependencies

- [X] Install Express: `npm install express`
- [X] Install MySQL: `npm install mysql2`
- [X] Install Environment config: `npm install dotenv`
- [X] Install HTTP client: `npm install axios`
- [X] Install Image library: `npm install canvas`
- [X] Install dev dependencies: `npm install --save-dev nodemon`

#### 1.3 Configuration Files

- [X] Create `.env` file with:
  ```
  PORT=3000
  DB_HOST=localhost
  DB_USER=root
  DB_PASSWORD=your_password
  DB_NAME=country_currency_db
  COUNTRIES_API_URL=https://restcountries.com/v2/all?fields=name,capital,region,population,flag,currencies
  EXCHANGE_API_URL=https://open.er-api.com/v6/latest/USD
  ```
- [X] Create `.env.example` (same as above but with placeholder values)
- [X] Create `.gitignore` file:
  ```
  node_modules/
  .env
  cache/
  *.log
  ```

#### 1.4 Database Setup

- [X] Create MySQL database: `CREATE DATABASE country_currency_db;`
- [X] Create `database/schema.sql` file with table structure:
  ```sql
  CREATE TABLE countries (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100) NOT NULL UNIQUE,
      capital VARCHAR(100),
      region VARCHAR(50),
      population BIGINT NOT NULL,
      currency_code VARCHAR(10),
      exchange_rate DECIMAL(15, 6),
      estimated_gdp DECIMAL(20, 2),
      flag_url VARCHAR(255),
      last_refreshed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_region (region),
      INDEX idx_currency (currency_code),
      INDEX idx_name (name)
  );
  ```
- [X] Run the SQL script in MySQL Workbench or CLI
- [ ] Test database connection manually

---

### Phase 2: Database Layer 🗄️

#### 2.1 Database Connection

- [X] Create `src/config/database.js`
  - [X] Set up MySQL connection pool
  - [X] Export pool with promise wrapper
  - [X] Add connection error handling
  - [ ] Test connection with a simple query

#### 2.2 Constants Configuration

- [ ] Create `src/config/constants.js`
  - [ ] Define API URLs
  - [ ] Define timeout values (10 seconds)
  - [ ] Define image dimensions (800x600)
  - [ ] Export all constants

#### 2.3 Country Model (SQL Queries)

- [X] Create `src/models/countryModel.js`
- [X] Write function: `upsertCountries(countriesArray)`
  - [X] Use `INSERT ... ON DUPLICATE KEY UPDATE`
  - [X] Handle bulk operations
  - [X] Return success/failure info
- [X] Write function: `getAllCountries(filters, sort)`
  - [X] Build dynamic WHERE clause for region filter
  - [X] Build dynamic WHERE clause for currency filter
  - [X] Build dynamic ORDER BY clause for sorting
  - [X] Use parameterized queries
- [X] Write function: `getCountryByName(name)`
  - [X] Use case-insensitive search (LOWER())
  - [X] Return single country or null
- [X] Write function: `deleteCountryByName(name)`
  - [X] Use case-insensitive match
  - [X] Return success/failure
- [X] Write function: `getStatus()`
  - [X] Count total countries
  - [X] Get last refresh timestamp
  - [X] Return both values
- [X] Write function: `getTopCountriesByGDP(limit)`
  - [X] Order by estimated_gdp DESC
  - [X] Return top N countries
- [ ] Test all functions with dummy data

---

### Phase 3: External API Integration 🌐

#### 3.1 Countries Service

- [ ] Create `src/services/countriesService.js`
- [ ] Write function: `fetchAllCountries()`
  - [ ] Use axios to call REST Countries API
  - [ ] Set timeout (10 seconds)
  - [ ] Parse response
  - [ ] Handle network errors
  - [ ] Return array of countries
- [ ] Test function independently (console.log results)
- [ ] Verify data structure matches expectations

#### 3.2 Exchange Service

- [ ] Create `src/services/exchangeService.js`
- [ ] Write function: `fetchExchangeRates()`
  - [ ] Use axios to call Exchange Rate API
  - [ ] Set timeout (10 seconds)
  - [ ] Parse response (rates are nested in `rates` object)
  - [ ] Handle network errors
  - [ ] Return rates object
- [ ] Test function independently (console.log results)
- [ ] Verify currency codes and rates structure

#### 3.3 Error Handling for APIs

- [ ] Add try-catch blocks
- [ ] Return 503 error if API fails
- [ ] Add detailed error messages
- [ ] Test timeout scenarios

---

### Phase 4: Data Processing Logic 🔄

#### 4.1 Data Transformer Service

- [ ] Create `src/services/dataTransformer.js`
- [ ] Write function: `transformCountries(countries, exchangeRates)`
  - [ ] Loop through each country
  - [ ] Extract first currency code from currencies array
  - [ ] Handle countries with no currencies (set to null)
  - [ ] Match currency code with exchange rate
  - [ ] Handle currencies not in exchange rates (set rate to null)
  - [ ] Generate random multiplier (1000-2000)
  - [ ] Calculate estimated_gdp = population × multiplier ÷ exchange_rate
  - [ ] Handle null cases for GDP (set to 0 or null)
  - [ ] Build transformed country object
  - [ ] Return array of transformed countries
- [ ] Test with sample data
- [ ] Verify GDP calculations are correct

#### 4.2 Helper Utilities

- [ ] Create `src/utils/helpers.js`
- [ ] Write function: `generateRandomMultiplier()`
  - [ ] Return random number between 1000-2000
- [ ] Write function: `formatTimestamp(date)`
  - [ ] Return ISO 8601 format
- [ ] Add any other helper functions needed

#### 4.3 Currency Matching Algorithm

- [ ] Test edge cases:
  - [ ] Country with multiple currencies (take first)
  - [ ] Country with empty currencies array
  - [ ] Currency code not in exchange rates
  - [ ] Missing population data

---

### Phase 5: Core Endpoints 🛣️

#### 5.1 Controllers Setup

- [ ] Create `src/controllers/countryController.js`
- [ ] Create `src/controllers/statusController.js`

#### 5.2 Routes Setup

- [ ] Create `src/routes/countryRoutes.js`
- [ ] Define all route paths (empty handlers for now)

#### 5.3 Express App Setup

- [ ] Create `src/app.js`
  - [ ] Initialize Express app
  - [ ] Add JSON middleware: `app.use(express.json())`
  - [ ] Add route handlers
  - [ ] Add error handler middleware (last)
  - [ ] Export app
- [ ] Create `server.js`
  - [ ] Import app
  - [ ] Start server on PORT from .env
  - [ ] Log server start message

#### 5.4 Build GET /status (Simplest First)

- [ ] In `statusController.js`, write `getStatus()`
  - [ ] Call `countryModel.getStatus()`
  - [ ] Return JSON response
  - [ ] Handle errors
- [ ] Test endpoint with Postman

#### 5.5 Build GET /countries/:name

- [ ] In `countryController.js`, write `getCountryByName()`
  - [ ] Extract name from req.params
  - [ ] Call `countryModel.getCountryByName(name)`
  - [ ] Return 404 if not found
  - [ ] Return country JSON if found
  - [ ] Handle errors
- [ ] Test endpoint with Postman

#### 5.6 Build GET /countries (With Filtering)

- [ ] In `countryController.js`, write `getAllCountries()`
  - [ ] Extract query params: region, currency, sort
  - [ ] Build filters object
  - [ ] Call `countryModel.getAllCountries(filters, sort)`
  - [ ] Return array of countries
  - [ ] Handle empty results
  - [ ] Handle errors
- [ ] Test endpoint with various filters:
  - [ ] `?region=Africa`
  - [ ] `?currency=NGN`
  - [ ] `?sort=gdp_desc`
  - [ ] `?region=Africa&sort=population_desc`

#### 5.7 Build DELETE /countries/:name

- [ ] In `countryController.js`, write `deleteCountry()`
  - [ ] Extract name from req.params
  - [ ] Call `countryModel.deleteCountryByName(name)`
  - [ ] Return 404 if not found
  - [ ] Return success message if deleted
  - [ ] Handle errors
- [ ] Test endpoint with Postman

#### 5.8 Build POST /countries/refresh (Most Complex)

- [ ] In `countryController.js`, write `refreshCountries()`
  - [ ] Call `countriesService.fetchAllCountries()`
  - [ ] Call `exchangeService.fetchExchangeRates()` (use Promise.all for speed)
  - [ ] Check if both APIs succeeded
  - [ ] Call `dataTransformer.transformCountries(countries, rates)`
  - [ ] Call `countryModel.upsertCountries(transformedData)`
  - [ ] Update last_refreshed_at timestamp
  - [ ] Trigger image generation (next phase)
  - [ ] Return success message with count
  - [ ] Handle API failures (return 503)
  - [ ] Handle database errors
- [ ] Test endpoint thoroughly
- [ ] Verify database records are updated/inserted correctly
- [ ] Test with empty database
- [ ] Test with existing data (update scenario)

---

### Phase 6: Image Generation 🖼️

#### 6.1 Image Service

- [ ] Create `src/services/imageService.js`
- [ ] Ensure `cache/` directory exists (create programmatically if not)
- [ ] Write function: `generateSummaryImage(totalCount, topCountries, timestamp)`
  - [ ] Import canvas library
  - [ ] Create canvas (800x600px)
  - [ ] Get 2D context
  - [ ] Set background color (white)
  - [ ] Draw title: "Country Currency Summary"
  - [ ] Draw total count text
  - [ ] Draw "Top 5 Countries by GDP" header
  - [ ] Draw table with country names and GDPs
  - [ ] Draw timestamp at bottom
  - [ ] Save to `cache/summary.png`
  - [ ] Handle file system errors
- [ ] Test image generation separately
- [ ] Open generated image to verify appearance

#### 6.2 Integrate Image Generation

- [ ] In `countryController.refreshCountries()`:
  - [ ] After successful database save
  - [ ] Fetch top 5 countries by GDP
  - [ ] Call `imageService.generateSummaryImage()`
  - [ ] Continue even if image generation fails (don't break refresh)

#### 6.3 Add GET /countries/image Endpoint

- [ ] In `countryController.js`, write `getImage()`
  - [ ] Check if `cache/summary.png` exists
  - [ ] If exists: serve file with `res.sendFile()`
  - [ ] If not exists: return 404 with error message
  - [ ] Handle errors
- [ ] Test endpoint after running refresh
- [ ] Test endpoint before running refresh (should return 404)

---

### Phase 7: Error Handling & Validation 🛡️

#### 7.1 Validation Middleware

- [ ] Create `src/middleware/validator.js`
- [ ] Write function: `validateRefresh()`
  - [ ] No validation needed (POST with no body)
  - [ ] Just pass through
- [ ] Write function: `validateCountryName()`
  - [ ] Check if name parameter exists
  - [ ] Check if name is not empty
  - [ ] Return 400 if invalid
- [ ] Add validation to appropriate routes

#### 7.2 Error Handler Middleware

- [ ] Create `src/middleware/errorHandler.js`
- [ ] Write global error handler:
  - [ ] Catch all errors passed via next(error)
  - [ ] Determine status code (default 500)
  - [ ] Format error response:
    ```json
    {
      "error": "Error message",
      "details": "Additional details if available"
    }
    ```
  - [ ] Log error to console (for debugging)
  - [ ] Never expose sensitive info (database errors, stack traces)
- [ ] Add error handler as last middleware in `app.js`

#### 7.3 Async Error Handling

- [ ] Review all async route handlers
- [ ] Ensure all use try-catch OR use async wrapper
- [ ] Option: Create `src/middleware/asyncHandler.js`
  - [ ] Wrap async functions to catch errors automatically
  - [ ] Use in routes: `router.get('/countries', asyncHandler(getAllCountries))`

#### 7.4 Test Error Scenarios

- [ ] Invalid country name (404)
- [ ] External API timeout (503)
- [ ] Database connection failure (500)
- [ ] Missing required fields (400)
- [ ] Malformed request body (400)

---

### Phase 8: Testing & Polish ✅

#### 8.1 Manual Testing with Postman

- [ ] Test POST /countries/refresh
  - [ ] First time (all inserts)
  - [ ] Second time (all updates)
  - [ ] Verify GDP values change (new random multiplier)
- [ ] Test GET /countries
  - [ ] No filters
  - [ ] With region filter
  - [ ] With currency filter
  - [ ] With sorting (gdp_desc, population_desc)
  - [ ] Combined filters
- [ ] Test GET /countries/:name
  - [ ] Existing country
  - [ ] Non-existing country (404)
  - [ ] Case-insensitive match
- [ ] Test DELETE /countries/:name
  - [ ] Existing country
  - [ ] Non-existing country (404)
- [ ] Test GET /status
  - [ ] Before refresh (empty or old data)
  - [ ] After refresh (updated data)
- [ ] Test GET /countries/image
  - [ ] Before refresh (404)
  - [ ] After refresh (image served)

#### 8.2 Edge Case Testing

- [ ] Empty database scenario
- [ ] Countries with no currencies
- [ ] Countries with multiple currencies
- [ ] Currency codes not in exchange rates
- [ ] External API failures
- [ ] Database connection loss
- [ ] Invalid query parameters

#### 8.3 Code Cleanup

- [ ] Add comments to complex logic
- [ ] Remove console.logs (or replace with proper logging)
- [ ] Check for unused imports
- [ ] Ensure consistent code style
- [ ] Verify all functions have error handling

#### 8.4 Logging (Optional)

- [ ] Create `src/utils/logger.js`
- [ ] Replace console.log with logger functions
- [ ] Add log levels (info, error, debug)

#### 8.5 README Documentation

- [ ] Create `README.md` with:
  - [ ] Project description
  - [ ] Prerequisites (Node.js, MySQL)
  - [ ] Installation steps
  - [ ] Environment variables setup
  - [ ] Database setup instructions
  - [ ] How to run the project
  - [ ] API endpoints documentation with examples
  - [ ] Sample requests and responses
  - [ ] Error response formats
  - [ ] Troubleshooting section

---

## 🔑 Key Implementation Strategies

### 1. Database Operations

- Use a **connection pool** (not individual connections)
- All queries should be **parameterized** to prevent SQL injection
- Create helper function for "upsert" logic (insert if not exists, update if exists)
- Use transactions if multiple queries must succeed together

### 2. External API Calls

- Set **timeouts** (e.g., 10 seconds) so your API doesn't hang
- Use **Promise.all()** to fetch both APIs concurrently (faster!)
- Be mindful of rate limits (though these APIs are generous)
- Consider caching last successful response if API fails (graceful degradation)

### 3. Currency Matching Algorithm

```
For each country:
  1. Extract first currency code from currencies array
  2. If no currencies → set currency_code = null, skip rate lookup
  3. Look up currency_code in exchange rates object
  4. If found → store rate
  5. If not found → set exchange_rate = null
  6. Calculate GDP only if both population and rate exist
```

### 4. Filtering & Sorting Logic

- Parse query parameters: `?region=Africa&currency=NGN&sort=gdp_desc`
- Build SQL dynamically based on what's provided:
  - `region` → `WHERE region = ?`
  - `currency` → `WHERE currency_code = ?`
  - `sort=gdp_desc` → `ORDER BY estimated_gdp DESC`
- Combine filters with `AND`

### 5. Image Generation

- Use **node-canvas** (works like HTML canvas)
- Design: 800x600px canvas, white background
- Display: Title, total count, top 5 GDP table, timestamp
- Save to `cache/summary.png`
- Serve with `res.sendFile()`

### 6. Error Handling Pattern

```
Try-catch in every controller →
  If error, pass to next(error) →
    Error middleware catches it →
      Returns consistent JSON
```

---

## 🛠️ Technology Choices Explained

**Why `mysql2` over `mysql`?**

- Supports promises (cleaner async code)
- Faster performance
- Prepared statements built-in

**Why NOT Sequelize?**

- You want raw SQL control (good for learning!)
- Less overhead, more transparent
- You see exactly what queries run

**Why `axios` for HTTP?**

- Clean API, widely used
- Built-in timeout support
- Handles JSON parsing automatically

**Why `dotenv`?**

- Never hardcode credentials
- Different configs for dev/production
- Industry standard

**Why `node-canvas` for images?**

- Most mature Node.js canvas library
- Similar to browser Canvas API
- Can draw text, shapes, images

---

## 💡 Pro Tips

1. **Use console.log liberally** while developing - See what data looks like at each step
2. **Test external APIs first** with Postman before coding
3. **Start with hard-coded data** in controllers, then connect real database
4. **Build incrementally** - Get one endpoint working perfectly before moving on
5. **Keep a Postman collection** with all your test requests
6. **Check the exchange rate API response format** - rates are nested in `rates` object
7. **Handle case-insensitivity** for country names (use LOWER() in SQL)
8. **The random multiplier** should generate fresh numbers each refresh (don't store it)

---

## 🚨 Common Pitfalls to Avoid

❌ Don't fetch countries one by one - do it in batch
❌ Don't forget to close database connections in error cases
❌ Don't return database errors directly to users (security risk)
❌ Don't forget the cache folder might not exist (create it programmatically)
❌ Don't use floating point for currency (though for this project it's okay)
❌ Don't forget UTC timestamps for consistency
❌ Don't skip validation - bad data will break your app later
❌ Don't give up if APIs return unexpected data - log and debug step by step

---

## 🎓 What You'll Learn

- REST API design patterns
- External API integration
- Database operations without ORM
- Error handling best practices
- File system operations
- Image generation with Canvas
- Data transformation logic
- Environment configuration
- SQL query optimization
- Async/await patterns

---

## 🚀 Recommended Build Order

1. **Phase 1** - Setup (get environment ready)
2. **Phase 2** - Database operations (test with dummy data first)
3. **Phase 3** - External APIs (test independently)
4. **Phase 4** - Data processing (combine everything)
5. **Phase 5** - Build endpoints one by one (start simple: status, get by name)
6. **Phase 5 (continued)** - Build refresh endpoint (the complex one)
7. **Phase 6** - Image generation (bonus feature)
8. **Phase 7** - Error handling (make it bulletproof)
9. **Phase 8** - Testing and documentation

---

## 📊 Data Flow Example (POST /countries/refresh)

```
1. User hits → POST /countries/refresh
2. Route → countryRoutes.js → calls controller
3. Controller → countryController.refreshCountries()
4. Controller calls → countriesService.fetchAllCountries()
5. Service fetches → REST Countries API (axios)
6. Controller calls → exchangeService.fetchExchangeRates()
7. Service fetches → Exchange Rate API (axios)
8. Controller calls → dataTransformer.transformCountries(countries, rates)
9. Transformer → creates array of processed country objects
10. Controller calls → countryModel.upsertCountries(data)
11. Model → runs SQL INSERT ... ON DUPLICATE KEY UPDATE
12. Controller calls → imageService.generateSummaryImage(topCountries)
13. Image saved → cache/summary.png
14. Controller returns → 200 OK with success message
```

---

## 📝 Sample Error Responses

### 404 - Not Found

```json
{
  "error": "Country not found"
}
```

### 400 - Validation Error

```json
{
  "error": "Validation failed",
  "details": {
    "name": "is required"
  }
}
```

### 503 - External API Failure

```json
{
  "error": "External data source unavailable",
  "details": "Could not fetch data from REST Countries API"
}
```

### 500 - Internal Server Error

```json
{
  "error": "Internal server error"
}
```

---

## ✅ Final Checklist Before Completion

- [ ] All endpoints working and tested
- [ ] Error handling implemented everywhere
- [ ] Image generation working
- [ ] README.md complete with setup instructions
- [ ] .env.example provided
- [ ] .gitignore includes sensitive files
- [ ] Code is commented where complex
- [ ] Database schema is optimized with indexes
- [ ] No hardcoded values (use .env)
- [ ] Consistent code style throughout
- [ ] All edge cases handled
- [ ] Project runs from scratch following README

---

**Good luck! Build it step by step, test constantly, and you'll have an amazing API! 🚀**
