require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const fileUpload = require("express-fileupload");
const path = require("path");
const errorHandler = require('./middlewares/error');
const { testConnection } = require('./database/config');

const PORT = process.env.PORT || 3011;

// Initial startup messages
console.log('\n');
console.log('\x1b[36m%s\x1b[0m', '🚀 Starting DallHam API Server...');
console.log('\x1b[33m%s\x1b[0m', '⚙️  Environment Variables:');
console.log('\x1b[34m%s\x1b[0m', `   HOST: ${process.env.HOST}`);
console.log('\x1b[34m%s\x1b[0m', `   PORT: ${process.env.PORT}`);
console.log('\x1b[34m%s\x1b[0m', `   DBHOST: ${process.env.DBHOST}`);
console.log('\x1b[34m%s\x1b[0m', `   DBNAME: ${process.env.DBNAME}`);
console.log('\x1b[34m%s\x1b[0m', `   NODE_ENV: ${process.env.NODE_ENV}`);
console.log('\n');

// CORS configuration
app.use(cors({
    origin: '*', // Allow all origins in development
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Basic middleware
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(fileUpload());

// Health check route
app.get('/api/health', async (req, res) => {
    try {
        await testConnection();
        res.json({
            success: true,
            message: 'API is running',
            environment: process.env.NODE_ENV,
            database: 'connected'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
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

// Error handler
app.use(errorHandler);

// Start server
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log('\x1b[32m%s\x1b[0m', '✅ Server Status:');
        console.log('\x1b[32m%s\x1b[0m', `   🌍 Running on: http://${process.env.HOST}:${PORT}`);
        console.log('\x1b[32m%s\x1b[0m', `   📚 API Docs: http://${process.env.HOST}:${PORT}/api/health`);
        console.log('\x1b[32m%s\x1b[0m', `   🔌 Database: ${process.env.DBHOST}/${process.env.DBNAME}`);
        console.log('\n');
        console.log('\x1b[35m%s\x1b[0m', '🌟 Server started successfully!');
        console.log('\n');
    });
}

module.exports = app;
