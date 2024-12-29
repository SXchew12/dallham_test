const mysql = require('mysql');

let config = {
    host: process.env.DBHOST,
    user: process.env.DBUSER,
    password: process.env.DBPASS,
    database: process.env.DBNAME,
    port: process.env.DBPORT || 3306,
    connectionLimit: 1,
    connectTimeout: 60000,
    waitForConnections: true,
    queueLimit: 0
};

if (process.env.NODE_ENV === 'production') {
    config = {
        ...config,
        ssl: {
            rejectUnauthorized: true
        }
    };
}

// Use connection pool instead of single connection for serverless
const pool = mysql.createPool(config);

// Test connection function
const testConnection = () => {
    return new Promise((resolve, reject) => {
        pool.getConnection((err, connection) => {
            if (err) {
                console.error('Database Connection Error:', err);
                reject(err);
                return;
            }
            console.log('Database Connected Successfully');
            connection.release();
            resolve();
        });
    });
};

module.exports = { pool, testConnection };