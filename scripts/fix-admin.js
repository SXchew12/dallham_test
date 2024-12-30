require('dotenv').config();
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

async function fixAdmin() {
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
        
        // 1. Reset admin password
        const hashedPassword = await bcrypt.hash('admin123', 10);
        await connection.query(`
            UPDATE admin 
            SET password = ?, 
                role = 'admin',
                uid = 'lnAnUIUnBBtXhcj5VHdaA2KERBgCTkWz'
            WHERE email = 'admin@admin.com'
        `, [hashedPassword]);

        // 2. Verify the update
        const [adminRows] = await connection.query(
            'SELECT * FROM admin WHERE email = ?', 
            ['admin@admin.com']
        );

        if (adminRows.length > 0) {
            const testPass = 'admin123';
            const isValid = await bcrypt.compare(testPass, adminRows[0].password);
            console.log('Admin updated:', {
                email: adminRows[0].email,
                role: adminRows[0].role,
                passwordValid: isValid
            });
        }

        await connection.end();
    } catch (error) {
        console.error('Fix failed:', error);
    }
}

fixAdmin(); 