require('dotenv').config();
const mysql = require('mysql2/promise');

async function testConnection() {
    const config = {
        host: process.env.MYSQLHOST,
        user: process.env.MYSQLUSER,
        password: process.env.MYSQLPASSWORD,
        database: process.env.MYSQLDATABASE,
        port: parseInt(process.env.MYSQLPORT),
        ssl: {
            rejectUnauthorized: false
        }
    };

    try {
        console.log('Testing connection with config:', {
            host: config.host,
            user: config.user,
            database: config.database,
            port: config.port
        });

        const connection = await mysql.createConnection(config);
        console.log('Connected successfully!');

        const [rows] = await connection.query('SHOW TABLES');
        console.log('\nExisting tables:');
        rows.forEach(row => {
            console.log(`- ${Object.values(row)[0]}`);
        });

        await connection.end();
    } catch (error) {
        console.error('Connection failed:', error);
    }
}

testConnection(); 