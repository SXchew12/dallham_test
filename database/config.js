const mysql = require('mysql2');

const config = {
    development: {
        host: process.env.DBHOST || 'localhost',
        user: process.env.DBUSER || 'root',
        password: process.env.DBPASS || 'localhost',
        database: process.env.DBNAME || 'dallham',
        port: process.env.DBPORT || '3306',
        ssl: undefined
    },
    production: {
        host: process.env.DBHOST,
        user: process.env.DBUSER,
        password: process.env.DBPASS,
        database: process.env.DBNAME,
        port: process.env.DBPORT || '3306',
        ssl: {
            rejectUnauthorized: false
        }
    }
};

const dbConfig = process.env.NODE_ENV === 'production' ? config.production : config.development;

console.log('Database Config:', {
    host: dbConfig.host,
    database: dbConfig.database,
    port: dbConfig.port,
    ssl: dbConfig.ssl ? 'Enabled' : 'Disabled',
    environment: process.env.NODE_ENV
});

const isMockMode = process.env.MOCK_MODE === 'true';

const mockPool = {
    promise: () => ({
        getConnection: async () => ({
            release: () => console.log('Mock connection released')
        }),
        query: async (sql, params) => {
            console.log('Mock query executed:', sql);
            
            // Mock admin login query
            if (sql.includes('SELECT * FROM admin WHERE email = ?')) {
                const [email] = params;
                if (email === 'admin@example.com') {
                    return [[{
                        uid: 'admin-123',
                        email: 'admin@example.com',
                        password: '$2a$10$mockhashedpassword', // Mock hashed password
                        role: 'admin'
                    }]];
                }
                return [[]];
            }
            
            return [[]];  // Default empty result
        }
    })
};

const pool = isMockMode ? mockPool : mysql.createPool(dbConfig).promise();

const testConnection = async () => {
    try {
        if (isMockMode) {
            console.log('Running in mock mode - no database connection required');
            return true;
        }
        const connection = await pool.getConnection();
        console.log('Database Connected Successfully');
        connection.release();
        return true;
    } catch (error) {
        console.error('Database Connection Failed:', error.message);
        return false;
    }
};

module.exports = { pool, testConnection };