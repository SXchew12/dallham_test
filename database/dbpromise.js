const mysql = require('mysql2/promise');

const createPool = () => {
    return mysql.createPool({
        host: process.env.MYSQLHOST,
        user: process.env.MYSQLUSER,
        password: process.env.MYSQLPASSWORD,
        database: process.env.MYSQLDATABASE,
        port: parseInt(process.env.MYSQLPORT),
        ssl: {
            rejectUnauthorized: false
        },
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0
    });
};

const pool = createPool();

const query = async (sql, params) => {
    try {
        const [results] = await pool.execute(sql, params);
        return results;
    } catch (error) {
        console.error('Database query error:', error);
        throw error;
    }
};

module.exports = { query, pool };   
