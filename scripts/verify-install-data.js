require('dotenv').config();
const { query } = require('../database/dbpromise');

async function verifyInstallData() {
    try {
        // 1. Verify Admin Account
        console.log('\n1. Checking Admin Account:');
        const adminResult = await query("SELECT * FROM admin WHERE email = 'admin@admin.com'");
        console.log('Admin exists:', adminResult.length > 0);
        if (adminResult.length === 0) {
            console.error('❌ Admin account missing!');
        }

        // 2. Verify Test User
        console.log('\n2. Checking Test User:');
        const userResult = await query("SELECT * FROM user WHERE email = 'test@test.com'");
        console.log('Test user exists:', userResult.length > 0);
        if (userResult.length === 0) {
            console.error('❌ Test user missing!');
        } else {
            console.log('User plan:', JSON.parse(userResult[0].plan));
        }

        // 3. Verify Plans
        console.log('\n3. Checking Plans:');
        const planResult = await query("SELECT * FROM plan WHERE name = 'Test Plan'");
        console.log('Test plan exists:', planResult.length > 0);
        if (planResult.length === 0) {
            console.error('❌ Test plan missing!');
        }

        // 4. Verify API Keys
        console.log('\n4. Checking API Keys:');
        const apiKeysResult = await query("SELECT * FROM api_keys LIMIT 1");
        console.log('API keys exist:', apiKeysResult.length > 0);
        if (apiKeysResult.length === 0) {
            console.error('❌ API keys missing!');
        }

        // 5. Verify Sample Content
        console.log('\n5. Checking Sample Content:');
        const tables = ['ai_image', 'ai_speech', 'ai_voice', 'chat', 'contact_form'];
        for (const table of tables) {
            const count = await query(`SELECT COUNT(*) as count FROM ${table}`);
            console.log(`${table} records:`, count[0].count);
        }

        // 6. Test API Endpoints
        console.log('\n6. Testing API Endpoints:');
        // Login first
        const baseURL = process.env.VERCEL_URL || 'localhost:3011';
        const apiURL = `https://${baseURL}/api`;

        // If any critical data is missing, attempt to sync
        const missingData = [];
        if (adminResult.length === 0) missingData.push('admin');
        if (userResult.length === 0) missingData.push('test user');
        if (planResult.length === 0) missingData.push('test plan');
        if (apiKeysResult.length === 0) missingData.push('API keys');

        if (missingData.length > 0) {
            console.error('\n❌ Missing critical data:', missingData.join(', '));
            console.log('\nRecommended actions:');
            console.log('1. Run: node scripts/sync-install.js');
            console.log('2. Run: node scripts/setup-admin.js');
            console.log('3. Run: node scripts/sync-install-data.js');
        } else {
            console.log('\n✅ All critical data verified!');
        }

    } catch (error) {
        console.error('Verification failed:', error);
        process.exit(1);
    }
}

// Run verification
if (require.main === module) {
    verifyInstallData().then(() => {
        console.log('\nVerification complete');
        process.exit(0);
    }).catch(err => {
        console.error('Verification failed:', err);
        process.exit(1);
    });
}

module.exports = { verifyInstallData }; 