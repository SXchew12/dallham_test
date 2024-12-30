require('dotenv').config();
const { query } = require('../database/dbpromise');
const fs = require('fs').promises;
const path = require('path');

async function verifyTables() {
    try {
        console.log('Reading install.sql to verify tables...');
        const installSql = await fs.readFile(path.join(__dirname, '../sql/install.sql'), 'utf8');
        
        // Extract CREATE TABLE statements to get table names
        const createTableStatements = installSql.match(/CREATE TABLE.*?\`(\w+)\`/g) || [];
        const tableNames = createTableStatements.map(stmt => 
            stmt.match(/\`(\w+)\`/)[1]
        );

        console.log('\nTables found in install.sql:', tableNames);

        // Check each table
        for (const table of tableNames) {
            try {
                const results = await query(`SELECT COUNT(*) as count FROM ${table}`);
                const [sample] = await query(`SELECT * FROM ${table} LIMIT 1`);
                
                console.log(`\nTable: ${table}`);
                console.log('- Record count:', results[0].count);
                console.log('- Sample record:', sample ? 'Found' : 'No records');
                if (sample) {
                    console.log('- Columns:', Object.keys(sample).join(', '));
                }
            } catch (err) {
                console.error(`Error checking table ${table}:`, err.message);
            }
        }

        // Special checks for critical tables
        const criticalChecks = [
            {
                table: 'admin',
                query: "SELECT email, role FROM admin WHERE email = 'admin@admin.com'"
            },
            {
                table: 'user',
                query: "SELECT email, role FROM user WHERE email = 'test@test.com'"
            },
            {
                table: 'faq',
                query: "SELECT COUNT(*) as count FROM faq"
            },
            {
                table: 'plan',
                query: "SELECT name, price FROM plan"
            }
        ];

        console.log('\nCritical Data Checks:');
        for (const check of criticalChecks) {
            try {
                const results = await query(check.query);
                console.log(`\n${check.table} check:`, results);
            } catch (err) {
                console.error(`Failed to check ${check.table}:`, err.message);
            }
        }

    } catch (error) {
        console.error('Verification failed:', error);
        process.exit(1);
    }
}

// Run verification
verifyTables().then(() => {
    console.log('\nVerification complete');
    process.exit(0);
}).catch(err => {
    console.error('Verification failed:', err);
    process.exit(1);
}); 