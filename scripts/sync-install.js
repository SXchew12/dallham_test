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

        // Extract and organize statements
        const createStatements = new Map(); // Table name -> create statement
        const insertStatements = new Map(); // Table name -> insert statements

        // Split and clean SQL statements
        const statements = installSql
            .replace(/\/\*.*?\*\//gs, '')
            .split(';')
            .map(stmt => stmt.trim())
            .filter(stmt => stmt.length > 0);

        // First pass: collect CREATE TABLE statements and their columns
        for (const stmt of statements) {
            if (stmt.toLowerCase().includes('create table')) {
                const tableName = stmt.match(/create table `?(\w+)`?/i)[1];
                createStatements.set(tableName, stmt);
                
                // Extract column definitions
                const columnDefs = stmt
                    .match(/\(([\s\S]*)\)/)[1]
                    .split(',')
                    .map(col => col.trim())
                    .filter(col => col.match(/^`?\w+`?\s+\w+/));
                
                const columns = columnDefs.map(col => col.match(/^`?(\w+)`?\s+/)[1]);
                console.log(`Table ${tableName} columns:`, columns);
            }
        }

        // Second pass: collect INSERT statements
        for (const stmt of statements) {
            if (stmt.toLowerCase().includes('insert into')) {
                const tableName = stmt.match(/insert into `?(\w+)`?/i)[1];
                if (!insertStatements.has(tableName)) {
                    insertStatements.set(tableName, []);
                }
                insertStatements.get(tableName).push(stmt);
            }
        }

        // Drop existing tables in reverse order
        console.log('\nDropping existing tables...');
        const dropTables = Array.from(createStatements.keys()).reverse();
        for (const table of dropTables) {
            try {
                await connection.query(`DROP TABLE IF EXISTS ${table}`);
                console.log(`Dropped table: ${table}`);
            } catch (err) {
                console.warn(`Note: Could not drop ${table}:`, err.message);
            }
        }

        // Create tables in order
        console.log('\nCreating tables...');
        for (const [tableName, createStmt] of createStatements) {
            try {
                await connection.query(createStmt);
                console.log(`Created table: ${tableName}`);
            } catch (err) {
                console.error(`Failed to create table ${tableName}:`, err.message);
                throw err;
            }
        }

        // Insert data
        console.log('\nInserting data...');
        for (const [tableName, inserts] of insertStatements) {
            for (const insertStmt of inserts) {
                try {
                    // Get column names from the INSERT statement or table definition
                    let columns = [];
                    const columnMatch = insertStmt.match(/INSERT INTO.*?\((.*?)\)\s+VALUES/i);
                    if (columnMatch) {
                        columns = columnMatch[1].split(',').map(col => col.trim().replace(/[`'"]/g, ''));
                    } else {
                        // Get columns from CREATE TABLE statement
                        const createStmt = createStatements.get(tableName);
                        const columnDefs = createStmt
                            .match(/\(([\s\S]*)\)/)[1]
                            .split(',')
                            .map(col => col.trim())
                            .filter(col => col.match(/^`?\w+`?\s+\w+/));
                        columns = columnDefs.map(col => col.match(/^`?(\w+)`?\s+/)[1]);
                    }

                    // Extract and process values
                    const valuesMatch = insertStmt.match(/VALUES\s*(\([\s\S]*\))/i);
                    if (!valuesMatch) continue;

                    const values = valuesMatch[1]
                        .split(/\),\s*\(/g)
                        .map(row => row.replace(/^\(|\)$/g, ''));

                    for (const row of values) {
                        const rowValues = row.split(',').map(val => val.trim());
                        
                        if (rowValues.length !== columns.length) {
                            console.error(`Column count mismatch in ${tableName}:`, {
                                expected: columns.length,
                                got: rowValues.length,
                                columns,
                                values: rowValues
                            });
                            continue;
                        }

                        const processedValues = rowValues.map(val => {
                            if (val.toLowerCase() === 'null') return null;
                            if (val === 'CURRENT_TIMESTAMP') return new Date();
                            if (val.startsWith("'") || val.startsWith('"')) {
                                return val.slice(1, -1).replace(/\\'/g, "'");
                            }
                            return val;
                        });

                        const sql = `INSERT INTO ${tableName} (${columns.join(',')}) VALUES (${columns.map(() => '?').join(',')})`;
                        await connection.query(sql, processedValues);
                        console.log(`Inserted row into: ${tableName}`);
                    }
                } catch (err) {
                    console.error(`Error processing ${tableName}:`, err.message);
                    if (process.env.NODE_ENV === 'development') {
                        console.error('Statement:', insertStmt);
                    }
                }
            }
        }

        // Verify data
        console.log('\nVerifying data...');
        for (const table of createStatements.keys()) {
            const [rows] = await connection.query(`SELECT COUNT(*) as count FROM ${table}`);
            console.log(`${table} records:`, rows[0].count);
        }

        console.log('\nSync completed successfully');

    } catch (error) {
        console.error('Sync failed:', error);
        throw error;
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

if (require.main === module) {
    syncInstall().then(() => {
        console.log('All done!');
        process.exit(0);
    }).catch(err => {
        console.error('Failed:', err);
        process.exit(1);
    });
}

module.exports = { syncInstall }; 