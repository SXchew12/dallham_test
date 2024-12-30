require('dotenv').config();
const mysql = require('mysql2/promise');

async function verifyTables() {
    const config = {
        host: process.env.MYSQLHOST || 'autorack.proxy.rlwy.net',
        user: process.env.MYSQLUSER || 'root',
        password: process.env.MYSQLPASSWORD,
        database: process.env.MYSQLDATABASE || 'railway',
        port: parseInt(process.env.MYSQLPORT || '58170'),
        ssl: {
            rejectUnauthorized: false
        }
    };

    try {
        const connection = await mysql.createConnection(config);
        
        // Test basic tables first
        const tables = ['admin', 'user', 'plan'];
        
        for (const table of tables) {
            try {
                const [rows] = await connection.execute(`SHOW TABLES LIKE '${table}'`);
                console.log(`Table ${table}: ${rows.length > 0 ? '✅' : '❌'}`);
            } catch (err) {
                console.error(`Error checking table ${table}:`, err.message);
            }
        }

        await connection.end();
    } catch (error) {
        console.error('Verification failed:', error);
    }
}

verifyTables(); 