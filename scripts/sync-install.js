require('dotenv').config();
const mysql = require('mysql2/promise');
const fs = require('fs').promises;
const path = require('path');

async function syncInstall() {
    let connection;
    try {
        console.log('Reading install.sql...');
        const installSql = await fs.readFile(path.join(__dirname, '../sql/install.sql'), 'utf8');
        
        const config = {
            host: process.env.MYSQLHOST,
            user: process.env.MYSQLUSER,
            password: process.env.MYSQLPASSWORD,
            database: process.env.MYSQLDATABASE,
            port: parseInt(process.env.MYSQLPORT),
            ssl: { rejectUnauthorized: false },
            multipleStatements: true
        };

        connection = await mysql.createConnection(config);
        console.log('Connected to database');

        // First, extract and organize all statements
        const createStatements = [];
        const insertStatements = new Map(); // Table name -> insert statements

        // Split and clean SQL statements
        const statements = installSql
            .replace(/\/\*.*?\*\//gs, '')
            .split(';')
            .map(stmt => stmt.trim())
            .filter(stmt => stmt.length > 0);

        // Organize statements by type
        for (const stmt of statements) {
            if (stmt.toLowerCase().includes('create table')) {
                createStatements.push(stmt);
            } else if (stmt.toLowerCase().includes('insert into')) {
                const tableName = stmt.match(/insert into `?(\w+)`?/i)[1];
                if (!insertStatements.has(tableName)) {
                    insertStatements.set(tableName, []);
                }
                insertStatements.get(tableName).push(stmt);
            }
        }

        // Drop existing tables in reverse order
        console.log('\nDropping existing tables...');
        const dropTables = [
            'web_public', 'web_private', 'user', 'testimonial', 'smtp',
            'plan', 'partners', 'page', 'orders', 'faq', 'embed_chats',
            'embed_chatbot', 'contact_form', 'chat', 'api_keys', 'ai_voice',
            'ai_video', 'ai_speech', 'ai_model', 'ai_image', 'admin'
        ];

        for (const table of dropTables) {
            try {
                await connection.query(`DROP TABLE IF EXISTS ${table}`);
                console.log(`Dropped table: ${table}`);
            } catch (err) {
                console.warn(`Note: Could not drop ${table}:`, err.message);
            }
        }

        // Create tables in correct order
        console.log('\nCreating tables...');
        for (const createStmt of createStatements) {
            try {
                await connection.query(createStmt);
                const tableName = createStmt.match(/create table `?(\w+)`?/i)[1];
                console.log(`Created table: ${tableName}`);
            } catch (err) {
                console.error('Failed to create table:', err.message);
                throw err;
            }
        }

        // Insert data with proper escaping
        console.log('\nInserting data...');
        
        // Get all table names from CREATE statements for insertion order
        const allTables = createStatements.map(stmt => 
            stmt.match(/create table `?(\w+)`?/i)[1]
        );

        // Process inserts for all tables found in install.sql
        for (const tableName of allTables) {
            const tableInserts = insertStatements.get(tableName) || [];
            for (const insertStmt of tableInserts) {
                try {
                    // Extract column names if present
                    let columns = [];
                    const columnMatch = insertStmt.match(/INSERT INTO.*?\((.*?)\)\s+VALUES/i);
                    if (columnMatch) {
                        columns = columnMatch[1].split(',').map(col => col.trim());
                    }

                    // Handle multi-row inserts
                    const values = insertStmt
                        .match(/VALUES\s*(\([\s\S]*\))/i)[1]
                        .split('),(')
                        .map(row => row.replace(/^\(|\)$/g, ''));

                    for (const row of values) {
                        // Properly escape string values
                        const escapedRow = row.split(',').map(val => {
                            val = val.trim();
                            if (val.startsWith("'") || val.startsWith('"')) {
                                return val;
                            } else if (val.toLowerCase() === 'null') {
                                return 'NULL';
                            } else if (val === 'CURRENT_TIMESTAMP') {
                                return 'CURRENT_TIMESTAMP';
                            } else {
                                return val;
                            }
                        }).join(',');

                        const singleInsertStmt = columns.length > 0 
                            ? `INSERT INTO ${tableName} (${columns.join(',')}) VALUES (${escapedRow})`
                            : `INSERT INTO ${tableName} VALUES (${escapedRow})`;

                        await connection.query(singleInsertStmt);
                        console.log(`Inserted row into: ${tableName}`);
                    }
                } catch (err) {
                    console.error(`Failed to insert into ${tableName}:`, err.message);
                    if (process.env.NODE_ENV === 'development') {
                        console.error('Statement:', insertStmt);
                    }
                }
            }
        }

        // Verify data
        console.log('\nVerifying data...');
        for (const table of ['admin', 'user', 'plan']) {
            const [rows] = await connection.query(`SELECT COUNT(*) as count FROM ${table}`);
            console.log(`${table} records:`, rows[0].count);
        }

        console.log('\nSync completed successfully');

    } catch (error) {
        console.error('Sync failed:', error);
        process.exit(1);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

syncInstall().then(() => {
    console.log('All done!');
    process.exit(0);
}).catch(err => {
    console.error('Failed:', err);
    process.exit(1);
}); 