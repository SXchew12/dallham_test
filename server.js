require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const fileUpload = require("express-fileupload");
const path = require("path");
const { testConnection } = require('./database/config');
const { syncInstall } = require('./scripts/sync-install');

// Log environment for debugging
console.log('Environment:', {
    NODE_ENV: process.env.NODE_ENV,
    MYSQLHOST: process.env.MYSQLHOST,
    MYSQLDATABASE: process.env.MYSQLDATABASE
});

// Test database connection
testConnection().then(connected => {
    if (!connected) {
        console.error('Failed to connect to database');
    }
});

// CORS configuration
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Basic middleware
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(fileUpload());

// Routes
app.use("/api/user", require("./routes/user"));
app.use("/api/web", require("./routes/web"));
app.use("/api/admin", require("./routes/admin"));
app.use("/api/plan", require("./routes/plan"));
app.use("/api/chat", require("./routes/chat"));
app.use("/api/embed", require("./routes/embed"));
app.use("/api/video", require("./routes/video"));

// Mock data for testing
const mockData = {
    user: { id: 1, email: 'test@example.com' },
    plans: [{ id: 1, name: 'Basic Plan', price: 10 }],
    chats: [{ id: 1, message: 'Test chat' }]
};

// Health check route with mock info
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'API is running',
        environment: process.env.NODE_ENV,
        mockMode: process.env.MOCK_MODE === 'true',
        debug: {
            mockModeValue: process.env.MOCK_MODE,
            nodeEnv: process.env.NODE_ENV
        }
    });
});

// Mock admin login
app.post('/api/admin/login', (req, res) => {
    const { email, password } = req.body;
    if (email === 'admin@example.com' && password === 'admin123') {
        res.json({
            success: true,
            token: 'mock-token-123'
        });
    } else {
        res.json({
            success: false,
            message: 'Invalid credentials'
        });
    }
});

// Error handler
app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

async function initializeDatabase() {
    try {
        console.log('Initializing database...');
        await syncInstall();
        console.log('Database initialization complete');
    } catch (error) {
        console.error('Database initialization failed:', error);
        // Don't exit process, just log the error
    }
}

// Start server for local development
if (process.env.NODE_ENV !== 'production') {
    const PORT = process.env.PORT || 3011;
    if (require.main === module) {
        initializeDatabase().then(() => {
            app.listen(PORT, () => {
                console.log(`Server running on port ${PORT}`);
            });
        });
    }
}

// Export for Vercel
module.exports = app;
