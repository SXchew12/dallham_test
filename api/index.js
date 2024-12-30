const express = require('express');
const app = express();

// Basic middleware
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// CORS headers
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});

// Simple health check that doesn't require database
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'API is running',
        environment: process.env.NODE_ENV
    });
});

// Routes
app.use("/api/user", require("./routes/user"));
app.use("/api/web", require("./routes/web"));
app.use("/api/admin", require("./routes/admin"));
app.use("/api/plan", require("./routes/plan"));
app.use("/api/chat", require("./routes/chat"));
app.use("/api/embed", require("./routes/embed"));
app.use("/api/video", require("./routes/video"));

// Error handler
app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({
        success: false,
        message: 'Internal server error'
    });
});

module.exports = app; 