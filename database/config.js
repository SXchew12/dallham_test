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
            
            // Mock admin login
            if (sql.includes('SELECT * FROM admin WHERE email = ?')) {
                const [email] = params;
                if (email === 'admin@example.com') {
                    return [[{
                        uid: 'admin-123',
                        email: 'admin@example.com',
                        password: '$2a$10$mockhashedpassword',
                        role: 'admin'
                    }]];
                }
                return [[]];
            }

            // Mock users list
            if (sql === 'SELECT * FROM user') {
                return [[
                    { uid: 'user1', email: 'user1@example.com', name: 'User One' },
                    { uid: 'user2', email: 'user2@example.com', name: 'User Two' }
                ]];
            }

            // Mock plans
            if (sql.includes('SELECT * FROM plan')) {
                return [[
                    { id: 1, name: 'Basic Plan', price: 10 },
                    { id: 2, name: 'Pro Plan', price: 20 }
                ]];
            }

            // Mock testimonials
            if (sql === 'SELECT * FROM testimonial') {
                return [[
                    { id: 1, title: 'Great Service', reviewer_name: 'John Doe' },
                    { id: 2, title: 'Amazing Product', reviewer_name: 'Jane Smith' }
                ]];
            }

            // Mock SMTP settings
            if (sql === 'SELECT * FROM smtp') {
                return [[{
                    email: 'smtp@example.com',
                    host: 'smtp.example.com',
                    port: '587',
                    password: 'mockpass'
                }]];
            }

            // Handle inserts/updates/deletes
            if (sql.includes('INSERT INTO') || 
                sql.includes('UPDATE') || 
                sql.includes('DELETE')) {
                return [{ affectedRows: 1 }];
            }

            return [[]];
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