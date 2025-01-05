require('dotenv').config();
const mysql = require('mysql2/promise');
const fs = require('fs').promises;
const path = require('path');

async function setupRailwayDB() {
    const config = {
        host: process.env.MYSQLHOST || 'autorack.proxy.rlwy.net',
        user: process.env.MYSQLUSER || 'root',
        password: process.env.MYSQLPASSWORD,
        database: process.env.MYSQLDATABASE || 'railway',
        port: parseInt(process.env.MYSQLPORT || '58170'),
        ssl: { rejectUnauthorized: false }
    };

    try {
        console.log('🚂 Connecting to Railway database...');
        const connection = await mysql.createConnection(config);
        
        // Clean existing tables
        console.log('🧹 Cleaning existing tables...');
        const [tables] = await connection.query('SHOW TABLES');
        for (const table of tables) {
            const tableName = Object.values(table)[0];
            await connection.query(`DROP TABLE IF EXISTS ${tableName}`);
        }

        console.log('📝 Creating tables...');

        // 1. Admin table
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

        // 2. User table
        await connection.query(`
            CREATE TABLE user (
                id int(11) NOT NULL AUTO_INCREMENT,
                role varchar(999) DEFAULT 'user',
                uid varchar(999) DEFAULT NULL,
                name varchar(999) DEFAULT NULL,
                email varchar(999) DEFAULT NULL,
                password varchar(999) DEFAULT NULL,
                mobile varchar(999) DEFAULT NULL,
                timezone varchar(999) DEFAULT 'Asia/Kolkata',
                plan longtext DEFAULT NULL,
                plan_expire varchar(999) DEFAULT NULL,
                trial int(1) DEFAULT 0,
                api_key varchar(999) DEFAULT NULL,
                gemini_token varchar(999) DEFAULT '0',
                openai_token varchar(999) DEFAULT '0',
                createdAt timestamp NULL DEFAULT current_timestamp(),
                PRIMARY KEY (id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);

        // 3. Plan table
        await connection.query(`
            CREATE TABLE plan (
                id int(11) NOT NULL AUTO_INCREMENT,
                name varchar(999) DEFAULT NULL,
                price varchar(999) DEFAULT NULL,
                in_app_chat int(1) DEFAULT 0,
                image_maker int(1) DEFAULT 0,
                code_writer int(1) DEFAULT 0,
                speech_to_text int(1) DEFAULT 0,
                voice_maker int(1) DEFAULT 0,
                ai_video int(1) DEFAULT 0,
                validity_days varchar(999) DEFAULT '0',
                gemini_token varchar(999) DEFAULT '0',
                openai_token varchar(999) DEFAULT '0',
                createdAt timestamp NULL DEFAULT current_timestamp(),
                PRIMARY KEY (id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);

        // 4. API Keys table
        await connection.query(`
            CREATE TABLE api_keys (
                id int(11) NOT NULL AUTO_INCREMENT,
                open_ai varchar(999) DEFAULT NULL,
                gemini_ai varchar(999) DEFAULT NULL,
                stable_diffusion varchar(999) DEFAULT NULL,
                createdAt timestamp NULL DEFAULT current_timestamp(),
                PRIMARY KEY (id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);

        // 5. AI Tables
        await connection.query(`
            CREATE TABLE ai_image (
                id int(11) NOT NULL AUTO_INCREMENT,
                uid varchar(999) DEFAULT NULL,
                ai_type varchar(999) DEFAULT NULL,
                image_size varchar(999) DEFAULT NULL,
                image_style varchar(999) DEFAULT NULL,
                prompt varchar(999) DEFAULT NULL,
                filename varchar(999) DEFAULT NULL,
                createdAt timestamp NULL DEFAULT current_timestamp(),
                PRIMARY KEY (id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);

        await connection.query(`
            CREATE TABLE ai_speech (
                id int(11) NOT NULL AUTO_INCREMENT,
                uid varchar(999) DEFAULT NULL,
                type varchar(999) DEFAULT NULL,
                filename varchar(999) DEFAULT NULL,
                output LONGTEXT DEFAULT NULL,
                createdAt timestamp NULL DEFAULT current_timestamp(),
                PRIMARY KEY (id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);

        await connection.query(`
            CREATE TABLE ai_voice (
                id int(11) NOT NULL AUTO_INCREMENT,
                uid varchar(999) DEFAULT NULL,
                prompt LONGTEXT DEFAULT NULL,
                voice varchar(999) DEFAULT NULL,
                filename varchar(999) DEFAULT NULL,
                createdAt timestamp NULL DEFAULT current_timestamp(),
                PRIMARY KEY (id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);

        await connection.query(`
            CREATE TABLE ai_video (
                id int(11) NOT NULL AUTO_INCREMENT,
                uid varchar(999) DEFAULT NULL,
                audio varchar(999) DEFAULT NULL,
                video varchar(999) DEFAULT NULL,
                caption LONGTEXT DEFAULT NULL,
                final_video varchar(999) DEFAULT NULL,
                status varchar(999) DEFAULT NULL,
                state LONGTEXT DEFAULT NULL,
                createdAt timestamp NULL DEFAULT current_timestamp(),
                PRIMARY KEY (id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);

        // 6. Web Tables
        await connection.query(`
            CREATE TABLE web_private (
                id int(11) NOT NULL AUTO_INCREMENT,
                pay_offline_id varchar(999) DEFAULT NULL,
                pay_offline_key varchar(999) DEFAULT NULL,
                offline_active varchar(999) DEFAULT NULL,
                pay_stripe_id varchar(999) DEFAULT NULL,
                pay_stripe_key varchar(999) DEFAULT NULL,
                stripe_active varchar(999) DEFAULT NULL,
                pay_paystack_id varchar(999) DEFAULT NULL,
                pay_paystack_key varchar(999) DEFAULT NULL,
                paystack_active varchar(999) DEFAULT NULL,
                createdAt timestamp NULL DEFAULT current_timestamp(),
                PRIMARY KEY (id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);

        await connection.query(`
            CREATE TABLE web_public (
                id int(11) NOT NULL AUTO_INCREMENT,
                currency_code varchar(999) DEFAULT NULL,
                logo varchar(999) DEFAULT NULL,
                app_name varchar(999) DEFAULT NULL,
                custom_home varchar(999) DEFAULT NULL,
                is_custom_home int(1) DEFAULT 0,
                meta_description LONGTEXT DEFAULT NULL,
                currency_symbol varchar(999) DEFAULT NULL,
                home_page_tutorial varchar(999) DEFAULT NULL,
                login_header_footer int(1) DEFAULT 0,
                exchange_rate varchar(999) DEFAULT NULL,
                createdAt timestamp NULL DEFAULT current_timestamp(),
                PRIMARY KEY (id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);

        // Insert default data
        console.log('📥 Inserting default data...');

        // Admin
        await connection.query(`
            INSERT INTO admin (email, password, role, uid) 
            VALUES ('admin@admin.com', '$2b$10$NpdbfaW2xj9dEJpiz9fyUuYbsY7JV9H7sTifhdPqTeUuVhWe2fex6', 'admin', 'lnAnUIUnBBtXhcj5VHdaA2KERBgCTkWz')
        `);

        // API Keys
        await connection.query(`
            INSERT INTO api_keys (open_ai, gemini_ai, stable_diffusion) 
            VALUES ('sk-proj-KA3vYIRjJ1gJ81DB4L2uT3BlbkFJtDiMXXXXXXXXXXX', 'AIzaSyA27vzeSnobuj1a67XJd_MXXXXXXXXXXX', 'sk-f9WeKwC7YuZAgS0wzTLDk4kO84fpRNDa8OMXXXXXXXXXXX')
        `);

        // Test User
        await connection.query(`
            INSERT INTO user (role, uid, name, email, password, mobile, timezone, plan, plan_expire, trial, gemini_token, openai_token) 
            VALUES (
                'user', 
                'testuser123', 
                'Test User', 
                'test@test.com', 
                '$2b$10$NpdbfaW2xj9dEJpiz9fyUuYbsY7JV9H7sTifhdPqTeUuVhWe2fex6', 
                '1234567890', 
                'UTC',
                '{"id":1,"name":"Full Access","price":"0","in_app_chat":1,"image_maker":1,"code_writer":1,"speech_to_text":1,"voice_maker":1,"ai_video":1,"validity_days":"365","gemini_token":"999999","openai_token":"999999"}',
                '1735689600000',
                0,
                '999999',
                '999999'
            )
        `);

        // Default Plan
        await connection.query(`
            INSERT INTO plan (name, price, in_app_chat, image_maker, code_writer, speech_to_text, voice_maker, ai_video, validity_days, gemini_token, openai_token)
            VALUES (
                'Test Plan',
                '0',
                1, 1, 1, 1, 1, 1,
                '365',
                '999999',
                '999999'
            )
        `);

        // Verify setup
        console.log('\n✅ Verifying setup...');
        const [allTables] = await connection.query('SHOW TABLES');
        console.log('\n📊 Database Status:');
        for (const tableRow of allTables) {
            const tableName = Object.values(tableRow)[0];
            const [count] = await connection.query(`SELECT COUNT(*) as count FROM ${tableName}`);
            console.log(`- ${tableName}: ${count[0].count} records`);
        }

        await connection.end();
        console.log('\n✨ Railway database setup completed successfully!');

    } catch (error) {
        console.error('❌ Setup failed:', error);
        process.exit(1);
    }
}

setupRailwayDB(); 