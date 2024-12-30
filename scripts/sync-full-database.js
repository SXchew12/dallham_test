require('dotenv').config();
const mysql = require('mysql2/promise');
const fs = require('fs').promises;
const path = require('path');

async function syncFullDatabase() {
    const config = {
        host: process.env.MYSQLHOST,
        user: process.env.MYSQLUSER,
        password: process.env.MYSQLPASSWORD,
        database: process.env.MYSQLDATABASE,
        port: parseInt(process.env.MYSQLPORT),
        ssl: { rejectUnauthorized: false }
    };

    try {
        console.log('Reading install.sql...');
        const installSql = await fs.readFile(path.join(__dirname, '../sql/install.sql'), 'utf8');
        
        const connection = await mysql.createConnection(config);
        console.log('Connected to database');

        // Drop existing tables to ensure clean state
        const tablesToDrop = ['admin', 'user', 'plans', 'orders', 'settings'];
        for (const table of tablesToDrop) {
            await connection.query(`DROP TABLE IF EXISTS ${table}`);
        }

        // Split SQL into individual statements
        const statements = installSql
            .split(';')
            .map(statement => statement.trim())
            .filter(statement => statement.length > 0);

        // Execute each statement
        for (const statement of statements) {
            try {
                await connection.query(statement);
                if (statement.toLowerCase().includes('create table')) {
                    const tableName = statement.match(/create table `?(\w+)`?/i)[1];
                    console.log(`Created table: ${tableName}`);
                } else if (statement.toLowerCase().includes('insert into')) {
                    const tableName = statement.match(/insert into `?(\w+)`?/i)[1];
                    console.log(`Inserted data into: ${tableName}`);
                }
            } catch (err) {
                console.error('Error executing statement:', err);
                console.log('Failed statement:', statement);
                throw err;
            }
        }

        // Verify all tables and data
        console.log('\nVerifying database state...');

        // 1. Verify admin
        const [admins] = await connection.query('SELECT * FROM admin');
        console.log('\nAdmin records:', admins.length);
        admins.forEach(admin => {
            console.log('Admin:', {
                email: admin.email,
                role: admin.role,
                uid: admin.uid
            });
        });

        // 2. Verify users
        const [users] = await connection.query('SELECT * FROM user');
        console.log('\nUser records:', users.length);
        users.forEach(user => {
            console.log('User:', {
                email: user.email,
                name: user.name,
                role: user.role,
                plan: user.plan ? JSON.parse(user.plan).name : null,
                tokens: {
                    gemini: user.gemini_token,
                    openai: user.openai_token
                }
            });
        });

        // 3. Verify plans
        const [plans] = await connection.query('SELECT * FROM plans');
        console.log('\nPlans:', plans.length);
        plans.forEach(plan => {
            console.log('Plan:', {
                name: plan.name,
                price: plan.price,
                features: {
                    in_app_chat: plan.in_app_chat,
                    image_maker: plan.image_maker,
                    code_writer: plan.code_writer,
                    speech_to_text: plan.speech_to_text,
                    voice_maker: plan.voice_maker,
                    ai_video: plan.ai_video
                }
            });
        });

        // 4. Verify settings
        const [settings] = await connection.query('SELECT * FROM settings');
        console.log('\nSettings:', settings.length);
        settings.forEach(setting => {
            console.log('Setting:', {
                name: setting.name,
                value: setting.value
            });
        });

        await connection.end();
        console.log('\nDatabase sync completed successfully');

    } catch (error) {
        console.error('Sync failed:', error);
        process.exit(1);
    }
}

syncFullDatabase(); 