require('dotenv').config();
const mysql = require('mysql2/promise');
const fs = require('fs').promises;
const path = require('path');

async function importTable(filename) {
    const config = {
        host: process.env.MYSQLHOST,
        user: process.env.MYSQLUSER,
        password: process.env.MYSQLPASSWORD,
        database: process.env.MYSQLDATABASE,
        port: parseInt(process.env.MYSQLPORT),
        ssl: {
            rejectUnauthorized: false
        },
        multipleStatements: true
    };

    try {
        console.log(`Importing ${filename}...`);
        const sqlFile = path.join(__dirname, '..', 'sql', filename);
        const sqlContent = await fs.readFile(sqlFile, 'utf8');

        const connection = await mysql.createConnection(config);
        await connection.query(sqlContent);
        
        console.log(`Successfully imported ${filename}`);
        await connection.end();
    } catch (error) {
        console.error(`Failed to import ${filename}:`, error.message);
    }
}

// If called directly
if (require.main === module) {
    const filename = process.argv[2];
    if (!filename) {
        console.error('Please provide a SQL filename');
        process.exit(1);
    }
    importTable(filename);
} 