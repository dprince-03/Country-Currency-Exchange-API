require('dotenv').config();
const compression = require('compression');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const express = require('express');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const session = require('express-session');

const app = express();
const PORT = process.env.PORT || 5080;


// ====================
// Middleware
// ====================
const corsConfig = {
    origin: process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',') : ['http://localhost:5000', 'http://localhost:5080'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials: true,
    optionsSuccessStatus: 200
};

const limiter = rateLimit({
	windowMs: 15 + 60 * 1000, // 15 minutes
	max: 100,
	message: "Too many requests from this IP, please try again after 15 minutes",
	standardHeaders: true,
	legacyHeaders: false,
});

const helmetConfig = {
	contentSecurityPolicy: {
		directives: {
			defaultSrc: ["'self'"],
			styleSrce: ["'self'", "https:", "'unsafe-inline'"],
			scriptSrc: ["'self'", "https:", "'unsafe-inline'"],
			imgSrc: ["'self'", "data:", "https:"],
			connectSrc: ["'self'", "https:"],
			fontSrc: ["'self'", "https:", "data:"],
			objectSrc: ["'none'"],
			upgradeInsecureRequests: [],
		},
	},
};

const sessionConfig = {
	secret: process.env.SESSION_SECRET || "your_session_secret",
	resave: false,
	saveUninitialized: false,
	cookie: {
		secure: process.env.NODE_ENV === "production",
		httpOnly: true,
		maxAge: 24 * 60 * 60 * 1000, // 24 hours
	},
};

app.use(helmet(helmetConfig));
app.use(cors(corsConfig));
app.use(compression());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());
app.use(morgan("dev"));

// Temporary debug middleware
app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    console.log('Body:', req.body);
    console.log('Content-Type:', req.headers['content-type']);
    next();
}); // Remove later after debuging 

// Security headers middleware
app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    next();
});


// ====================
// Routes
// ====================
// limiter useage 
app.use('/api', limiter);

// Health Check route
app.get('/api/health', (req, res) => {
    res.status(200).json({
        success: true,
        status: ok,
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV
    });
});

// api route


// ====================
// Error Handling
// ====================


// ====================
// Server 
// ====================
const start_server = async () => {
    try {
        console.log('');
        console.log('='.repeat(30));
        console.log('Starting Server...');
        console.log('='.repeat(30));
        console.log('Initializing database...');
        console.log('='.repeat(30));
        
        // Initialize database
        // init db here 

        const server = app.listen(PORT, () => {
            console.log('');
            console.log('='.repeat(30));
            console.log(`Server is runnig on ${PORT}`);
            console.log(`API URL: http://localhost:${PORT}/api`);
            console.log('='.repeat(30));
            console.log('');
            console.log('='.repeat(50));
            console.log("".repeat(3));
            console.log('   ...Press CTRL+C to stop the server...   ');
            console.log(''.repeat(3));
            console.log('='.repeat(50));
            
        });

        const shutdown = async (signal) => {
            console.log('');
            console.log('='.repeat(50));
            console.log(`${signal} received. Shutting down gracefully...`);
            console.log('='.repeat(50));
            
            server.close(async () => {
                console.log('');
                console.log('HTTP server closed');
                
                // Close database connections
                console.log('Closing database connections...');
                // close connection here...
                
                console.log('All connections closed');
                console.log('');
                console.log('Goodbye bro!!!');
                console.log('');
                
                process.exit(0);
            });

            setTimeout(() => {
                console.error('');
                console.error('Forcing server shutdown after timeout...');
                console.error('');
                process.exit(1);
            }, 10000);

        };
        process.on('SIGTERM', () => shutdown('SIGTERM'));
        process.on('SIGINT', () => shutdown('SIGINT'));

        process.on('uncaughtException', (err) => {
            console.error('');
            console.error(`Uncaught Exception: ${err}`);
            console.error('');
            shutdown('UNCAUGHT_EXCEPTION');
        });

        process.on('unhandledRejection', (reason, promise) => {
            console.error('');
            console.error('Unhandled Rejection at:', promise);
            console.error('Reason:', reason);
            console.error('');
            shutdown('UNHANDLED_REJECTION');
        });

    } catch (error) {
        console.error('');
        console.error('='.repeat(30));
        console.error('Failed to start server');
        console.error('='.repeat(30));
        console.error('');
        console.error(`Error: ${error.message}`);
        console.error('');
        process.exit(1);
    }
};

start_server();

module.exports = app;