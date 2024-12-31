export default function handler(req, res) {
    try {
        res.status(200).json({
            success: true,
            message: 'API is working',
            environment: process.env.NODE_ENV,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
} 