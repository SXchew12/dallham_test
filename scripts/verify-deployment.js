require('dotenv').config();
const fetch = require('node-fetch');

async function verifyDeployment() {
    const environments = [
        { name: 'Local', url: 'http://localhost:3011' },
        { name: 'Production', url: `https://${process.env.VERCEL_URL || 'dallham-test5.vercel.app'}` }
    ];

    for (const env of environments) {
        console.log(`\nTesting ${env.name} Environment: ${env.url}`);
        try {
            // 1. Test basic API connection
            console.log('\n1. Testing API connection...');
            const testRes = await fetch(`${env.url}/api/test`);
            if (!testRes.ok) throw new Error(`API test failed with status ${testRes.status}`);
            console.log('✅ API connection successful');

            // 2. Test admin login
            console.log('\n2. Testing admin login...');
            const loginRes = await fetch(`${env.url}/api/admin/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: 'admin@admin.com',
                    password: 'password'
                })
            });

            const loginData = await loginRes.json();
            if (!loginData.success) throw new Error('Login failed');
            console.log('✅ Admin login successful');

            // 3. Test data endpoints
            console.log('\n3. Testing data endpoints...');
            const endpoints = [
                '/api/admin/get_users',
                '/api/admin/get_plans',
                '/api/admin/verify-db'
            ];

            for (const endpoint of endpoints) {
                try {
                    console.log(`\nTesting ${endpoint}...`);
                    const response = await fetch(`${env.url}${endpoint}`, {
                        headers: { 
                            'Authorization': `Bearer ${loginData.token}`,
                            'Accept': 'application/json'
                        }
                    });

                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }

                    const text = await response.text();
                    let data;
                    try {
                        data = JSON.parse(text);
                    } catch (e) {
                        console.error('Invalid JSON response:', text);
                        throw new Error('Invalid JSON response');
                    }

                    if (!data.success) {
                        throw new Error(data.message || 'API request failed');
                    }

                    console.log(`✅ ${endpoint} successful`);
                    
                    // Log specific data counts
                    if (endpoint.includes('users')) {
                        console.log(`   Users found: ${data.users?.length || 0}`);
                    }
                    if (endpoint.includes('plans')) {
                        console.log(`   Plans found: ${data.plans?.length || 0}`);
                    }
                } catch (error) {
                    console.error(`❌ ${endpoint} failed:`, error.message);
                }
            }

        } catch (error) {
            console.error(`❌ ${env.name} verification failed:`, error.message);
        }
    }
}

verifyDeployment().then(() => {
    console.log('\nVerification complete');
}).catch(err => {
    console.error('Verification failed:', err);
    process.exit(1);
}); 