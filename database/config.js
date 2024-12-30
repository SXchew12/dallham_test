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
    queueLimit: 0,
    // MariaDB specific settings
    multipleStatements: true,
    typeCast: true
};

if (process.env.NODE_ENV === 'production') {
    config = {
        ...config,
        ssl: {
            rejectUnauthorized: false
        }
    };
}

// Use connection pool instead of single connection for serverless
const pool = mysql.createPool(config);

// Test connection function with retry
const testConnection = (retries = 3) => {
    return new Promise((resolve, reject) => {
        const tryConnect = (retriesLeft) => {
            const timeout = setTimeout(() => {
                reject(new Error('Connection timeout'));
            }, 5000); // 5 second timeout

            pool.getConnection((err, connection) => {
                clearTimeout(timeout);
                if (err) {
                    console.error('Database Connection Error:', err);
                    if (retriesLeft > 0) {
                        console.log(`Retrying connection... (${retriesLeft} attempts left)`);
                        setTimeout(() => tryConnect(retriesLeft - 1), 1000);
                    } else {
                        reject(err);
                    }
                    return;
                }
                console.log('Database Connected Successfully');
                connection.release();
                resolve();
            });
        };
        tryConnect(retries);
    });
};

module.exports = { pool, testConnection };