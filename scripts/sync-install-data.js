require('dotenv').config();
const mysql = require('mysql2/promise');
const fs = require('fs').promises;
const path = require('path');

async function syncInstallData() {
    let connection;
    try {
        const config = {
            host: process.env.MYSQLHOST,
            user: process.env.MYSQLUSER,
            password: process.env.MYSQLPASSWORD,
            database: process.env.MYSQLDATABASE,
            port: parseInt(process.env.MYSQLPORT),
            ssl: { rejectUnauthorized: false }
        };

        connection = await mysql.createConnection(config);
        console.log('Connected to database');

        // 1. Insert Admin (if not exists)
        console.log('\nSyncing admin...');
        await connection.query(`
            INSERT IGNORE INTO admin (role, uid, email, password) 
            VALUES (
                'admin', 
                'lnAnUIUnBBtXhcj5VHdaA2KERBgCTkWz',
                'admin@admin.com',
                '$2b$10$NpdbfaW2xj9dEJpiz9fyUuYbsY7JV9H7sTifhdPqTeUuVhWe2fex6'
            )
        `);

        // 2. Insert Test User (if not exists)
        console.log('\nSyncing test user...');
        const testUserPlan = {
            id: 1,
            name: "Full Access",
            price: "0",
            in_app_chat: 1,
            image_maker: 1,
            code_writer: 1,
            speech_to_text: 1,
            voice_maker: 1,
            ai_video: 1,
            validity_days: "365",
            gemini_token: "999999",
            openai_token: "999999"
        };

        await connection.query(`
            INSERT IGNORE INTO user (
                role, uid, name, email, password, mobile, timezone,
                plan, plan_expire, trial, gemini_token, openai_token
            ) VALUES (
                'user', 'testuser123', 'Test User', 'test@test.com',
                '$2b$10$NpdbfaW2xj9dEJpiz9fyUuYbsY7JV9H7sTifhdPqTeUuVhWe2fex6',
                '1234567890', 'UTC', ?, '1735689600000', 0, '999999', '999999'
            )
        `, [JSON.stringify(testUserPlan)]);

        // 3. Insert Test Plan (if not exists)
        console.log('\nSyncing test plan...');
        await connection.query(`
            INSERT IGNORE INTO plan (
                name, price, in_app_chat, image_maker, code_writer,
                speech_to_text, voice_maker, ai_video, validity_days,
                gemini_token, openai_token
            ) VALUES (
                'Test Plan', '0', 1, 1, 1, 1, 1, 1, '365',
                '999999', '999999'
            )
        `);

        // 4. Insert API Keys (if not exists)
        console.log('\nSyncing API keys...');
        await connection.query(`
            INSERT IGNORE INTO api_keys (open_ai, gemini_ai, stable_diffusion)
            VALUES (?, ?, ?)
        `, [
            'sk-proj-KA3vYIRjJ1gJ81DB4L2uT3BlbkFJtDiMXXXXXXXXXXX',
            'AIzaSyA27vzeSnobuj1a67XJd_MXXXXXXXXXXX',
            'sk-f9WeKwC7YuZAgS0wzTLDk4kO84fpRNDa8OMXXXXXXXXXXX'
        ]);

        // Verify the data
        console.log('\nVerifying synchronized data...');
        const tables = ['admin', 'user', 'plan', 'api_keys'];
        for (const table of tables) {
            const [rows] = await connection.query(`SELECT COUNT(*) as count FROM ${table}`);
            console.log(`${table}: ${rows[0].count} records`);
        }

        console.log('\nSync completed successfully');

    } catch (error) {
        console.error('Sync failed:', error);
        throw error;
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

if (require.main === module) {
    syncInstallData().then(() => {
        console.log('All done!');
        process.exit(0);
    }).catch(err => {
        console.error('Failed:', err);
        process.exit(1);
    });
}

module.exports = { syncInstallData }; 