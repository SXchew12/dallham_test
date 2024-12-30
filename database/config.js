const mysql = require('mysql2');

const config = {
    development: {
        host: process.env.DBHOST || 'localhost',
        user: process.env.DBUSER || 'root',
        password: process.env.DBPASS || 'localhost',
        database: process.env.DBNAME || 'dallham',
        port: process.env.DBPORT || '3306',
        ssl: process.env.NODE_ENV === 'production' ? {
            rejectUnauthorized: true
        } : undefined
    },
    production: {
        host: process.env.DBHOST,
        user: process.env.DBUSER,
        password: process.env.DBPASS,
        database: process.env.DBNAME,
        port: process.env.DBPORT,
        ssl: {
            rejectUnauthorized: true
        }
    }
};

const dbConfig = process.env.NODE_ENV === 'production' ? config.production : config.development;

console.log('Database Config:', {
    host: dbConfig.host,
    database: dbConfig.database,
    port: dbConfig.port,
    ssl: dbConfig.ssl ? 'Enabled' : 'Disabled'
});

const pool = mysql.createPool(dbConfig).promise();

// Add test connection function
const testConnection = async () => {
    try {
        const connection = await pool.getConnection();
        console.log('Database Connected Successfully');
        connection.release();
        return true;
    } catch (error) {
        console.error('Database Connection Failed:', error);
        throw error;
    }
};

module.exports = { pool, testConnection };