require('dotenv').config();
const fetch = require('node-fetch');

async function testAPIEndpoints() {
    const baseURL = (process.env.VERCEL_URL || 'dallham-test5.vercel.app').replace(/\/$/, '');
    const apiURL = `https://${baseURL}/api`;
    let adminToken;

    try {
        // 1. Admin Login
        console.log('\nTesting admin login...');
        const loginRes = await fetch(`${apiURL}/admin/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'admin@admin.com',
                password: 'password'
            })
        });
        
        const loginData = await loginRes.json();
        console.log('Login response:', loginData);

        if (!loginData.success) {
            throw new Error(`Login failed: ${loginData.msg || 'Unknown error'}`);
        }

        adminToken = loginData.token;

        // Test various admin endpoints
        const endpoints = [
            { method: 'GET', path: '/admin/profile' },
            { method: 'GET', path: '/admin/get_users' },
            { method: 'GET', path: '/admin/get_plans' },
            { method: 'GET', path: '/admin/get_settings' },
            { method: 'GET', path: '/admin/get_orders' }
        ];

        for (const endpoint of endpoints) {
            console.log(`\nTesting ${endpoint.method} ${endpoint.path}...`);
            const response = await fetch(`${apiURL}${endpoint.path}`, {
                method: endpoint.method,
                headers: { 
                    'Authorization': `Bearer ${adminToken}`,
                    'Accept': 'application/json'
                }
            });

            const data = await response.json();
            console.log(`Response from ${endpoint.path}:`, data);
        }

    } catch (error) {
        console.error('Test failed:', error);
        process.exit(1);
    }
}

testAPIEndpoints(); 