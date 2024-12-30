const mysql = require('mysql');

const config = {
    host: process.env.DBHOST,
    user: process.env.DBUSER,
    password: process.env.DBPASS,
    database: process.env.DBNAME,
    port: process.env.DBPORT || 3306,
    connectionLimit: 10,
    connectTimeout: 30000,
    waitForConnections: true,
    queueLimit: 0,
    ssl: process.env.NODE_ENV === 'production' ? {
        rejectUnauthorized: false
    } : false
};

const pool = mysql.createPool(config);

const testConnection = () => {
    return new Promise((resolve, reject) => {
        pool.getConnection((err, connection) => {
            if (err) {
                console.error('Database Connection Failed:', err);
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