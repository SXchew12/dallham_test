require('dotenv').config();
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

async function createAdmin() {
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
        
        // First, delete any existing admin with this email
        await connection.query('DELETE FROM admin WHERE email = ?', ['admin@admin.com']);
        
        // Create new admin with specified credentials
        const hashedPassword = await bcrypt.hash('password', 10);
        await connection.query(`
            INSERT INTO admin (email, password, role, uid) 
            VALUES (?, ?, 'admin', 'lnAnUIUnBBtXhcj5VHdaA2KERBgCTkWz')
        `, ['admin@admin.com', hashedPassword]);
        
        // Verify the insertion
        const [adminRows] = await connection.query(
            'SELECT * FROM admin WHERE email = ?', 
            ['admin@admin.com']
        );

        if (adminRows.length > 0) {
            // Test the password
            const isValid = await bcrypt.compare('password', adminRows[0].password);
            console.log('Admin created successfully:', {
                email: adminRows[0].email,
                role: adminRows[0].role,
                uid: adminRows[0].uid,
                passwordValid: isValid
            });
        }

        await connection.end();
    } catch (error) {
        console.error('Failed to create admin:', error);
    }
}

createAdmin(); 