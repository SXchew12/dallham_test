require('dotenv').config();
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

async function verifyAdmin() {
    const config = {
        host: process.env.MYSQLHOST,
        user: process.env.MYSQLUSER,
        password: process.env.MYSQLPASSWORD,
        database: process.env.MYSQLDATABASE,
        port: parseInt(process.env.MYSQLPORT),
        ssl: {
            rejectUnauthorized: false
        }
    };

    try {
        const connection = await mysql.createConnection(config);
        
        // Check admin table
        const [adminRows] = await connection.query('SELECT * FROM admin WHERE email = ?', ['admin@admin.com']);
        
        if (adminRows.length === 0) {
            console.log('Admin user not found. Creating default admin...');
            
            const hashedPassword = await bcrypt.hash('admin123', 10);
            await connection.query(`
                INSERT INTO admin (email, password, role, uid) 
                VALUES (?, ?, 'admin', 'lnAnUIUnBBtXhcj5VHdaA2KERBgCTkWz')
            `, ['admin@admin.com', hashedPassword]);
            
            console.log('Default admin created');
        } else {
            console.log('Admin exists:', {
                email: adminRows[0].email,
                role: adminRows[0].role,
                uid: adminRows[0].uid
            });
            
            // Test password
            const testPass = 'admin123';
            const isValid = await bcrypt.compare(testPass, adminRows[0].password);
            console.log('Password valid:', isValid);
        }

        await connection.end();
    } catch (error) {
        console.error('Admin verification failed:', error);
    }
}

verifyAdmin(); 