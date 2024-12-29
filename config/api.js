const getApiUrl = () => {
    return process.env.NODE_ENV === 'production'
        ? 'https://your-api-domain.vercel.app'
        : 'http://localhost:3011';
};

module.exports = { getApiUrl }; 