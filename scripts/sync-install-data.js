require('dotenv').config();
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

async function syncInstallData() {
    const config = {
        host: process.env.MYSQLHOST,
        user: process.env.MYSQLUSER,
        password: process.env.MYSQLPASSWORD,
        database: process.env.MYSQLDATABASE,
        port: parseInt(process.env.MYSQLPORT),
        ssl: { rejectUnauthorized: false }
    };

    try {
        console.log('Connecting to database with config:', {
            host: config.host,
            user: config.user,
            database: config.database,
            port: config.port
        });

        const connection = await mysql.createConnection(config);
        console.log('Connected successfully');

        // Check if user table exists
        const [tables] = await connection.query('SHOW TABLES LIKE "user"');
        console.log('\nUser table exists:', tables.length > 0);

        if (tables.length === 0) {
            console.log('Creating user table...');
            await connection.query(`
                CREATE TABLE user (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    role VARCHAR(999) DEFAULT 'user',
                    uid VARCHAR(999) DEFAULT NULL,
                    name VARCHAR(999) DEFAULT NULL,
                    email VARCHAR(999) DEFAULT NULL,
                    password VARCHAR(999) DEFAULT NULL,
                    mobile VARCHAR(999) DEFAULT NULL,
                    timezone VARCHAR(999) DEFAULT 'UTC',
                    plan LONGTEXT DEFAULT NULL,
                    plan_expire VARCHAR(999) DEFAULT NULL,
                    trial INT(1) DEFAULT 0,
                    api_key VARCHAR(999) DEFAULT NULL,
                    gemini_token VARCHAR(999) DEFAULT '0',
                    openai_token VARCHAR(999) DEFAULT '0',
                    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            `);
            console.log('User table created');
        }
        
        // 1. First verify if test user exists
        const [existingUsers] = await connection.query(
            'SELECT * FROM user WHERE email = ?', 
            ['test@test.com']
        );
        console.log('\nExisting test users found:', existingUsers.length);

        if (existingUsers.length === 0) {
            console.log('\nInserting test user...');
            
            // Insert test user from install.sql
            const testUserData = {
                role: 'user',
                uid: 'testuser123',
                name: 'Test User',
                email: 'test@test.com',
                password: '$2b$10$NpdbfaW2xj9dEJpiz9fyUuYbsY7JV9H7sTifhdPqTeUuVhWe2fex6',
                mobile: '1234567890',
                timezone: 'UTC',
                plan: JSON.stringify({
                    id: 1,
                    name: "Full Access",
                    price: "0",
                    in_app_chat: 1,
                    image_maker: 1,
                    code_writer: 1,
                    speech_to_text: 1,
                    voice_maker: 1,
                    ai_video: 1,
                    validity_days: "365",
                    gemini_token: "999999",
                    openai_token: "999999"
                }),
                plan_expire: '1735689600000',
                trial: 0,
                gemini_token: '999999',
                openai_token: '999999'
            };

            try {
                await connection.query(`
                    INSERT INTO user 
                    (role, uid, name, email, password, mobile, timezone, plan, 
                    plan_expire, trial, gemini_token, openai_token) 
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                `, [
                    testUserData.role,
                    testUserData.uid,
                    testUserData.name,
                    testUserData.email,
                    testUserData.password,
                    testUserData.mobile,
                    testUserData.timezone,
                    testUserData.plan,
                    testUserData.plan_expire,
                    testUserData.trial,
                    testUserData.gemini_token,
                    testUserData.openai_token
                ]);
                console.log('Test user created successfully');
            } catch (insertError) {
                console.error('Error inserting test user:', insertError);
            }
        }

        // Verify users
        const [users] = await connection.query('SELECT * FROM user');
        console.log('\nTotal users found:', users.length);
        users.forEach(user => {
            console.log('\nUser:', {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                uid: user.uid,
                plan: user.plan ? JSON.parse(user.plan).name : null
            });
        });

        await connection.end();
    } catch (error) {
        console.error('Sync failed:', error);
        console.error('Full error:', error.stack);
    }
}

syncInstallData(); 