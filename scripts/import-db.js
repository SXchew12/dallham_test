require('dotenv').config();
const mysql = require('mysql2/promise');
const fs = require('fs').promises;
const path = require('path');

async function importDatabase() {
    console.log('Environment Variables:', {
        host: process.env.MYSQLHOST,
        user: process.env.MYSQLUSER,
        database: process.env.MYSQLDATABASE,
        port: process.env.MYSQLPORT
    });

    const config = {
        host: process.env.MYSQLHOST,
        user: process.env.MYSQLUSER,
        password: process.env.MYSQLPASSWORD,
        port: parseInt(process.env.MYSQLPORT),
        ssl: {
            rejectUnauthorized: false
        },
        multipleStatements: true
    };

    try {
        console.log('Reading SQL file...');
        const sqlFile = path.join(__dirname, '..', 'install.sql');
        const sqlContent = await fs.readFile(sqlFile, 'utf8');

        console.log('Connecting to database...');
        const connection = await mysql.createConnection(config);
        
        console.log('Creating and using database...');
        await connection.query(`DROP DATABASE IF EXISTS ${process.env.MYSQLDATABASE}`);
        await connection.query(`CREATE DATABASE ${process.env.MYSQLDATABASE}`);
        await connection.query(`USE ${process.env.MYSQLDATABASE}`);

        // Split and execute SQL statements one by one
        console.log('Importing SQL file...');
        const statements = sqlContent
            .split(';')
            .map(statement => statement.trim())
            .filter(statement => statement.length > 0);

        for (const statement of statements) {
            try {
                await connection.query(statement);
            } catch (err) {
                console.error('Error executing statement:', err.message);
                console.error('Statement:', statement.slice(0, 150) + '...');
            }
        }

        console.log('Database import completed successfully!');
        await connection.end();

    } catch (error) {
        console.error('Import failed:', error);
        console.error('Connection config:', {
            host: config.host,
            user: config.user,
            database: process.env.MYSQLDATABASE,
            port: config.port
        });
        process.exit(1);
    }
}

importDatabase(); 