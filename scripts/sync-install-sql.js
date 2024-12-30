require('dotenv').config();
const mysql = require('mysql2/promise');
const fs = require('fs').promises;
const path = require('path');

async function syncInstallSQL() {
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
        
        // Split SQL into individual statements
        const statements = installSql
            .split(';')
            .map(statement => statement.trim())
            .filter(statement => statement.length > 0);

        console.log(`Found ${statements.length} SQL statements`);
        
        const connection = await mysql.createConnection(config);
        console.log('Connected to database');

        // Execute each statement
        for (const statement of statements) {
            try {
                if (statement.toLowerCase().includes('create table')) {
                    const tableName = statement.match(/create table `?(\w+)`?/i)[1];
                    console.log(`\nProcessing table: ${tableName}`);
                    
                    // Check if table exists
                    const [tables] = await connection.query('SHOW TABLES LIKE ?', [tableName]);
                    if (tables.length > 0) {
                        console.log(`Table ${tableName} already exists`);
                        continue;
                    }
                }
                
                await connection.query(statement);
                console.log('Statement executed successfully');
            } catch (err) {
                if (!err.message.includes('already exists')) {
                    console.error('Error executing statement:', err);
                    console.log('Statement:', statement);
                }
            }
        }

        // Verify critical tables and data
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
                plan: user.plan ? JSON.parse(user.plan).name : null
            });
        });

        // 3. Verify plans
        const [plans] = await connection.query('SELECT * FROM plans');
        console.log('\nPlans:', plans.length);
        plans.forEach(plan => {
            console.log('Plan:', {
                name: plan.name,
                price: plan.price
            });
        });

        await connection.end();
        console.log('\nDatabase sync completed successfully');

    } catch (error) {
        console.error('Sync failed:', error);
    }
}

// Run the sync
syncInstallSQL(); 