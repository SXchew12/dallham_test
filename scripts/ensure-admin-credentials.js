require('dotenv').config();
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const fs = require('fs').promises;
const path = require('path');

async function ensureAdminCredentials() {
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
        
        // Extract admin credentials from install.sql
        const adminMatch = installSql.match(/INSERT INTO `admin`.*VALUES\s*\((.*)\)/i);
        if (!adminMatch) {
            throw new Error('Admin credentials not found in install.sql');
        }

        const connection = await mysql.createConnection(config);
        console.log('Connected to database');

        // First ensure admin table exists with correct structure
        await connection.query(`
            CREATE TABLE IF NOT EXISTS admin (
                id int(11) NOT NULL AUTO_INCREMENT,
                role varchar(999) DEFAULT 'admin',
                uid varchar(999) DEFAULT NULL,
                email varchar(999) DEFAULT NULL,
                password varchar(999) DEFAULT NULL,
                createdAt timestamp NULL DEFAULT current_timestamp(),
                PRIMARY KEY (id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);

        // Clear existing admin
        await connection.query('DELETE FROM admin WHERE email = ?', ['admin@admin.com']);

        // Insert admin from install.sql
        await connection.query(`
            INSERT INTO admin (id, role, uid, email, password, createdAt) 
            VALUES (1, 'admin', 'lnAnUIUnBBtXhcj5VHdaA2KERBgCTkWz', 'admin@admin.com', 
            '$2b$10$NpdbfaW2xj9dEJpiz9fyUuYbsY7JV9H7sTifhdPqTeUuVhWe2fex6', 
            '2024-07-21 13:59:47')
        `);

        // Verify the admin
        const [admins] = await connection.query(
            'SELECT * FROM admin WHERE email = ?', 
            ['admin@admin.com']
        );

        if (admins.length > 0) {
            const admin = admins[0];
            // Test both passwords
            const isValidPassword = await bcrypt.compare('password', admin.password);
            const isValidAdmin123 = await bcrypt.compare('admin123', admin.password);

            console.log('\nAdmin verification:', {
                email: admin.email,
                role: admin.role,
                uid: admin.uid,
                passwordHash: admin.password,
                isValidWithPassword: isValidPassword,
                isValidWithAdmin123: isValidAdmin123
            });

            if (!isValidPassword && !isValidAdmin123) {
                console.log('\nResetting password to "password"...');
                const hashedPassword = await bcrypt.hash('password', 10);
                await connection.query(
                    'UPDATE admin SET password = ? WHERE email = ?',
                    [hashedPassword, 'admin@admin.com']
                );
            }
        }

        await connection.end();
        console.log('\nAdmin credentials synchronized successfully');

    } catch (error) {
        console.error('Sync failed:', error);
    }
}

ensureAdminCredentials(); 