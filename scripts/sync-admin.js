require('dotenv').config();
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const fs = require('fs').promises;
const path = require('path');

async function syncAdmin() {
    try {
        // 1. Read install.sql file
        const installSql = await fs.readFile(path.join(__dirname, '../sql/install.sql'), 'utf8');
        
        // Extract admin credentials from install.sql
        const adminMatch = installSql.match(/INSERT INTO admin.*VALUES\s*\((.*)\)/i);
        if (!adminMatch) {
            throw new Error('Admin credentials not found in install.sql');
        }

        const values = adminMatch[1].split(',').map(v => v.trim().replace(/^['"]|['"]$/g, ''));
        const [email, password, role, uid] = values;

        console.log('Found credentials in install.sql:', {
            email,
            passwordHash: password.substring(0, 20) + '...',
            role,
            uid
        });

        // 2. Connect to database
        const config = {
            host: process.env.MYSQLHOST,
            user: process.env.MYSQLUSER,
            password: process.env.MYSQLPASSWORD,
            database: process.env.MYSQLDATABASE,
            port: parseInt(process.env.MYSQLPORT),
            ssl: { rejectUnauthorized: false }
        };

        const connection = await mysql.createConnection(config);

        // 3. Update admin with original credentials
        await connection.query(`
            UPDATE admin 
            SET password = ?,
                role = ?,
                uid = ?
            WHERE email = ?
        `, [password, role, uid, email]);

        // 4. Verify update
        const [adminRows] = await connection.query(
            'SELECT * FROM admin WHERE email = ?', 
            [email]
        );

        if (adminRows.length > 0) {
            console.log('Admin synced:', {
                email: adminRows[0].email,
                role: adminRows[0].role,
                uid: adminRows[0].uid,
                passwordHash: adminRows[0].password.substring(0, 20) + '...'
            });

            // 5. Verify if password matches the one in routes/admin.js mock
            const testPass = 'admin123';
            const isValid = await bcrypt.compare(testPass, adminRows[0].password);
            console.log('Password valid with admin123:', isValid);
        }

        await connection.end();
    } catch (error) {
        console.error('Sync failed:', error);
    }
}

syncAdmin(); 