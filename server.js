require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const fileUpload = require("express-fileupload");
const path = require("path");
const errorHandler = require('./middlewares/error');
const { testConnection } = require('./database/config');

const PORT = process.env.PORT || 3011;

// Add Vercel-specific headers
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});

// Basic middleware
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(cors({
    origin: process.env.NODE_ENV === 'production' 
        ? [process.env.FRONTENDURI]
        : 'http://localhost:3011',
    credentials: true
}));
app.use(fileUpload());

// Health check endpoint
app.get('/api/health', async (req, res) => {
    try {
        await testConnection();
        res.json({
            success: true,
            environment: process.env.NODE_ENV,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: process.env.NODE_ENV === 'production' ? 'Internal Server Error' : error.message
        });
    }
});

// Welcome route
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'Welcome to DallHam API',
        version: '4.0',
        status: 'running'
    });
});

// Database connection middleware
app.use(async (req, res, next) => {
    if (req.path === '/api/health') return next();
    
    try {
        await testConnection();
        next();
    } catch (error) {
        console.error('Database connection failed:', error);
        res.status(500).json({
            success: false,
            message: 'Database connection failed',
            error: process.env.NODE_ENV === 'production' ? 'Internal Server Error' : error.message
        });
    }
});

// Routes
const userRoute = require("./routes/user");
app.use("/api/user", userRoute);

const webRoute = require("./routes/web");
app.use("/api/web", webRoute);

const adminRoute = require("./routes/admin");
app.use("/api/admin", adminRoute);

const planRoute = require("./routes/plan");
app.use("/api/plan", planRoute);

const chatRoute = require("./routes/chat");
app.use("/api/chat", chatRoute);

const embedRoute = require("./routes/embed");
app.use("/api/embed", embedRoute);

const videoRoute = require("./routes/video");
app.use("/api/video", videoRoute);

// Static files
if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, 'public')));
} else {
    app.use(express.static(path.resolve(__dirname, "./client/public")));
}

// Error handler
app.use(errorHandler);

// Development server
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log('\x1b[36m%s\x1b[0m', '🚀 Welcome to DallHam API v4.0');
        console.log('\x1b[32m%s\x1b[0m', `🌍 Server is running on port ${PORT}`);
        console.log('\x1b[33m%s\x1b[0m', `⚙️  Environment: ${process.env.NODE_ENV}`);
        console.log('\x1b[34m%s\x1b[0m', `🗄️  Database: ${process.env.DBHOST}`);
    });
}

// Export for Vercel
module.exports = app;
