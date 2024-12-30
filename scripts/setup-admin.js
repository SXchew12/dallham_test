require('dotenv').config();
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

async function setupAdmin() {
    const config = {
        host: process.env.MYSQLHOST,
        user: process.env.MYSQLUSER,
        password: process.env.MYSQLPASSWORD,
        database: process.env.MYSQLDATABASE,
        port: parseInt(process.env.MYSQLPORT),
        ssl: { rejectUnauthorized: false }
    };

    try {
        const connection = await mysql.createConnection(config);
        console.log('Connected to database');

        // Drop and recreate admin table to ensure clean state
        await connection.query('DROP TABLE IF EXISTS admin');
        await connection.query(`
            CREATE TABLE admin (
                id int(11) NOT NULL AUTO_INCREMENT,
                role varchar(999) DEFAULT 'admin',
                uid varchar(999) DEFAULT NULL,
                email varchar(999) DEFAULT NULL,
                password varchar(999) DEFAULT NULL,
                createdAt timestamp NULL DEFAULT current_timestamp(),
                PRIMARY KEY (id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);

        // Insert admin with exact values from 01_admin.sql
        await connection.query(`
            INSERT INTO admin (email, password, role, uid) 
            VALUES ('admin@admin.com', '$2b$10$NpdbfaW2xj9dEJpiz9fyUuYbsY7JV9H7sTifhdPqTeUuVhWe2fex6', 'admin', 'lnAnUIUnBBtXhcj5VHdaA2KERBgCTkWz')
        `);

        // Verify the admin and password
        const [admins] = await connection.query(
            'SELECT * FROM admin WHERE email = ?', 
            ['admin@admin.com']
        );

        if (admins.length > 0) {
            const admin = admins[0];
            const isValid = await bcrypt.compare('password', admin.password);
            console.log('\nAdmin verification:', {
                email: admin.email,
                role: admin.role,
                uid: admin.uid,
                passwordValid: isValid,
                passwordHash: admin.password
            });

            if (!isValid) {
                throw new Error('Password verification failed - hash does not match "password"');
            }
        } else {
            throw new Error('Admin not found after insertion');
        }

        await connection.end();
        console.log('\nAdmin setup completed successfully');

    } catch (error) {
        console.error('Setup failed:', error);
        process.exit(1);
    }
}

setupAdmin(); 