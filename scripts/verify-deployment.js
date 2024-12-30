require('dotenv').config();
const mysql = require('mysql2/promise');

async function verifyDeployment() {
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
        console.log('Verifying deployment configuration...');
        console.log('Environment:', process.env.NODE_ENV);
        console.log('Database config:', {
            host: config.host,
            user: config.user,
            database: config.database,
            port: config.port
        });

        const connection = await mysql.createConnection(config);
        console.log('Database connection successful');

        const [tables] = await connection.query('SHOW TABLES');
        console.log('\nVerifying tables:');
        const tableNames = tables.map(t => Object.values(t)[0]);
        console.log(tableNames);

        // Verify essential tables
        const essentialTables = [
            'admin', 'user', 'plan', 'api_keys',
            'ai_image', 'ai_speech', 'ai_voice', 'ai_video',
            'web_private', 'web_public'
        ];

        const missingTables = essentialTables.filter(t => !tableNames.includes(t));
        if (missingTables.length > 0) {
            console.error('\nMissing tables:', missingTables);
        } else {
            console.log('\nAll essential tables present ✅');
        }

        await connection.end();
    } catch (error) {
        console.error('Deployment verification failed:', error);
    }
}

verifyDeployment(); 