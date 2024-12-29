require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const fileUpload = require("express-fileupload");
const path = require("path");
const errorHandler = require('./middlewares/error');
const { testConnection } = require('./database/config');

const PORT = process.env.PORT || 3011;

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
// app.use(express.urlencoded({ extended: true }));
app.use(cors({
    origin: process.env.NODE_ENV === 'production' 
        ? ['https://your-frontend-domain.com', 'https://your-admin-domain.com']
        : 'http://localhost:3011',
    credentials: true
}));
app.use(express.json());
app.use(fileUpload());

app.use(async (req, res, next) => {
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

// routers
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
const { processTask } = require("./loops/render/render");
app.use("/api/video", videoRoute);

app.get('/api/health', async (req, res) => {
    try {
        await testConnection();
        res.json({
            success: true,
            environment: process.env.NODE_ENV,
            timestamp: new Date().toISOString(),
            message: 'API is running',
            version: '4.0',
            database: {
                connected: true,
                host: process.env.DBHOST
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: process.env.NODE_ENV === 'production' ? 'Internal Server Error' : error.message
        });
    }
});

if (process.env.NODE_ENV === 'production') {
    console.log('Running in production mode');
}

if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, 'public')));
} else {
    app.use(express.static(path.resolve(__dirname, "./client/public")));
}

app.get("*", function (request, response) {
  response.sendFile(path.resolve(__dirname, "./client/public", "index.html"));
});

setTimeout(() => {
  processTask();
}, 2000);

app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV}`);
    console.log(`Database: ${process.env.DATABASE_HOST}`);
});
