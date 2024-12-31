const mysql = require('mysql2');

const config = {
    host: process.env.MYSQLHOST,
    user: process.env.MYSQLUSER,
    password: process.env.MYSQLPASSWORD,
    database: process.env.MYSQLDATABASE,
    port: parseInt(process.env.MYSQLPORT),
    ssl: { rejectUnauthorized: false },
    multipleStatements: true
};

async function testConnection() {
    const connection = mysql.createConnection(config);
    try {
        await connection.connect();
        console.log('Database connected successfully');
        return true;
    } catch (error) {
        console.error('Database connection failed:', error);
        return false;
    } finally {
        connection.end();
    }
}

module.exports = { config, testConnection };