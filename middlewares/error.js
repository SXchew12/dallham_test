const errorHandler = (err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        msg: process.env.NODE_ENV === 'production' 
            ? 'Internal Server Error' 
            : err.message
    });
};

module.exports = errorHandler; 