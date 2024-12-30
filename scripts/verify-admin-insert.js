require('dotenv').config();
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

async function verifyAdminInsert() {
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
        
        // Get admin details
        const [admins] = await connection.query(
            'SELECT * FROM admin WHERE email = ?', 
            ['admin@admin.com']
        );

        if (admins.length > 0) {
            const admin = admins[0];
            console.log('\nAdmin Record Found:', {
                id: admin.id,
                email: admin.email,
                role: admin.role,
                uid: admin.uid,
                createdAt: admin.createdAt,
                passwordHash: admin.password.substring(0, 20) + '...'
            });

            // Verify password
            const testPass = 'password';
            const isValid = await bcrypt.compare(testPass, admin.password);
            console.log('\nPassword Verification:', {
                testPassword: testPass,
                isValid: isValid
            });

            // Check table structure
            const [columns] = await connection.query('DESCRIBE admin');
            console.log('\nTable Structure:', columns.map(c => ({
                Field: c.Field,
                Type: c.Type,
                Null: c.Null,
                Key: c.Key,
                Default: c.Default
            })));
        } else {
            console.log('No admin found with email: admin@admin.com');
        }

        await connection.end();
    } catch (error) {
        console.error('Verification failed:', error);
    }
}

verifyAdminInsert(); 