require('dotenv').config();
const fetch = require('node-fetch');

async function testAllAPIs() {
    const baseURL = (process.env.VERCEL_URL || 'localhost:3011').replace(/\/$/, '');
    const apiURL = `https://${baseURL}/api`;
    let adminToken;

    try {
        // 1. Basic API Test
        console.log('\n1. Testing Basic API Connection:');
        const testRes = await fetch(`${apiURL}/test`);
        console.log('Basic API:', await testRes.json());

        // 2. Admin Login
        console.log('\n2. Testing Admin Login:');
        const loginRes = await fetch(`${apiURL}/admin/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'admin@admin.com',
                password: 'password'
            })
        });
        
        const loginData = await loginRes.json();
        if (!loginData.success) {
            throw new Error(`Login failed: ${loginData.message}`);
        }
        adminToken = loginData.token;
        console.log('Login successful, token received');

        // 3. Test All Admin Endpoints
        const adminEndpoints = [
            { method: 'GET', path: '/admin/profile' },
            { method: 'GET', path: '/admin/get_users' },
            { method: 'GET', path: '/admin/get_plans' },
            { method: 'GET', path: '/admin/verify-db' },
            { method: 'GET', path: '/web/get_keys' },
            { method: 'GET', path: '/web/get_web_public' }
        ];

        console.log('\n3. Testing Admin Endpoints:');
        for (const endpoint of adminEndpoints) {
            console.log(`\nTesting ${endpoint.method} ${endpoint.path}...`);
            const response = await fetch(`${apiURL}${endpoint.path}`, {
                method: endpoint.method,
                headers: { 
                    'Authorization': `Bearer ${adminToken}`,
                    'Accept': 'application/json'
                }
            });

            const data = await response.json();
            if (!data.success) {
                console.error(`❌ ${endpoint.path} failed:`, data.message);
            } else {
                console.log(`✅ ${endpoint.path} successful`);
                // Log specific data counts
                if (endpoint.path === '/admin/get_users') {
                    console.log(`Users found: ${data.users?.length || 0}`);
                }
                if (endpoint.path === '/admin/get_plans') {
                    console.log(`Plans found: ${data.plans?.length || 0}`);
                }
            }
        }

    } catch (error) {
        console.error('Test failed:', error);
        process.exit(1);
    }
}

testAllAPIs().then(() => {
    console.log('\nAll API tests complete');
}).catch(err => {
    console.error('Tests failed:', err);
    process.exit(1);
}); 