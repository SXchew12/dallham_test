require('dotenv').config();
const mysql = require('mysql2/promise');

async function resetDatabase() {
    const config = {
        host: process.env.MYSQLHOST,
        user: process.env.MYSQLUSER,
        password: process.env.MYSQLPASSWORD,
        port: parseInt(process.env.MYSQLPORT),
        ssl: {
            rejectUnauthorized: false
        }
    };

    try {
        console.log('Connecting to MySQL...');
        console.log('Using config:', {
            host: config.host,
            user: config.user,
            port: config.port
        });

        const connection = await mysql.createConnection(config);

        console.log('Dropping and recreating database...');
        await connection.query(`DROP DATABASE IF EXISTS ${process.env.MYSQLDATABASE}`);
        await connection.query(`CREATE DATABASE ${process.env.MYSQLDATABASE}`);

        console.log('Database reset completed!');
        await connection.end();

    } catch (error) {
        console.error('Reset failed:', error);
        process.exit(1);
    }
}

resetDatabase(); 