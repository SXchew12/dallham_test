require('dotenv').config();
const mysql = require('mysql2/promise');

async function testConnection() {
    const config = {
        host: 'autorack.proxy.rlwy.net',
        user: 'root',
        password: 'VTpaAXmqFKYgAnWiBfMygSZiapSqMwgA',
        database: 'railway',
        port: 58170,
        ssl: {
            rejectUnauthorized: false
        },
        connectTimeout: 30000
    };

    try {
        console.log('Attempting to connect...');
        const connection = await mysql.createConnection(config);
        console.log('Connected successfully!');
        
        // Test query
        const [rows] = await connection.execute('SHOW TABLES');
        console.log('Tables:', rows);
        
        await connection.end();
    } catch (error) {
        console.error('Connection failed:', error);
    }
}

testConnection(); 