const mysql = require('mysql2');

const config = {
    development: {
        host: process.env.DBHOST || 'localhost',
        user: process.env.DBUSER || 'root',
        password: process.env.DBPASS || '',
        database: process.env.DBNAME || 'dallham',
        port: process.env.DBPORT || '3306',
        ssl: undefined
    },
    production: {
        host: process.env.MYSQLHOST || 'autorack.proxy.rlwy.net',
        user: process.env.MYSQLUSER || 'root',
        password: process.env.MYSQLPASSWORD,
        database: process.env.MYSQLDATABASE || 'railway',
        port: process.env.MYSQLPORT || '58170',
        ssl: {
            rejectUnauthorized: false,
            enableTrace: true
        },
        connectTimeout: 30000,
        waitForConnections: true,
        connectionLimit: 10,
        maxIdle: 10,
        idleTimeout: 60000,
        queueLimit: 0
    }
};

const dbConfig = process.env.NODE_ENV === 'production' ? config.production : config.development;

console.log('Attempting connection with:', {
    host: dbConfig.host,
    user: dbConfig.user,
    database: dbConfig.database,
    port: dbConfig.port
});

const pool = mysql.createPool(dbConfig).promise();

const testConnection = async () => {
    try {
        const connection = await pool.getConnection();
        console.log('Database Connected Successfully');
        connection.release();
        return true;
    } catch (error) {
        console.error('Database Connection Failed:', error.message);
        console.error('Full error:', error);
        return false;
    }
};

module.exports = { pool, testConnection };