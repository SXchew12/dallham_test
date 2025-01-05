require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Middleware
app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));

// Root route - Welcome message
app.get('/', (req, res) => {
    res.json({
        message: "Welcome to Dallham Testing Apps",
        status: "online",
        version: "1.0.0",
        documentation: "/api",
        health: "/health"
    });
});

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

// Routes
app.use('/api/admin', require('./routes/admin'));
app.use('/api/user', require('./routes/user'));
app.use("/api/web", require("./routes/web"));
app.use("/api/plan", require("./routes/plan"));
app.use("/api/chat", require("./routes/chat"));
app.use("/api/embed", require("./routes/embed"));
app.use("/api/video", require("./routes/video"));

const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
    try {
        // Test Prisma connection
        await prisma.$connect();
        console.log('✅ Database connected successfully');
        console.log(`🚀 Server running on port ${PORT}`);
    } catch (error) {
        console.error('❌ Database connection failed:', error);
        process.exit(1);
    }
});

// Export for Vercel
module.exports = app;
