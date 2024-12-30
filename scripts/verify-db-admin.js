require('dotenv').config();
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

async function verifyDBAdmin() {
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
        
        // 1. Check if admin table exists
        const [tables] = await connection.query('SHOW TABLES LIKE "admin"');
        console.log('Admin table exists:', tables.length > 0);

        // 2. Check admin table structure
        const [columns] = await connection.query('DESCRIBE admin');
        console.log('\nAdmin table structure:', columns.map(c => c.Field));

        // 3. Check admin records
        const [admins] = await connection.query('SELECT * FROM admin');
        console.log('\nNumber of admin records:', admins.length);
        
        if (admins.length > 0) {
            console.log('Admin record:', {
                id: admins[0].id,
                email: admins[0].email,
                role: admins[0].role,
                uid: admins[0].uid,
                passwordHash: admins[0].password?.substring(0, 20) + '...'
            });
        }

        // 4. Drop and recreate admin if needed
        if (admins.length === 0 || !admins[0].password) {
            console.log('\nRecreating admin user...');
            await connection.query('DELETE FROM admin WHERE email = ?', ['admin@admin.com']);
            
            const hashedPassword = await bcrypt.hash('admin123', 10);
            await connection.query(`
                INSERT INTO admin (email, password, role, uid) 
                VALUES (?, ?, 'admin', 'lnAnUIUnBBtXhcj5VHdaA2KERBgCTkWz')
            `, ['admin@admin.com', hashedPassword]);
            
            const [newAdmin] = await connection.query('SELECT * FROM admin WHERE email = ?', ['admin@admin.com']);
            console.log('New admin created:', {
                email: newAdmin[0].email,
                role: newAdmin[0].role,
                uid: newAdmin[0].uid
            });
        }

        await connection.end();
    } catch (error) {
        console.error('Verification failed:', error);
    }
}

verifyDBAdmin(); 