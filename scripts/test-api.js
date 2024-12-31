require('dotenv').config();
const fetch = require('node-fetch');

async function testAPI() {
    const baseURL = process.env.VERCEL_URL || 'localhost:3011';
    const apiURL = `https://${baseURL}/api`;

    try {
        // Test basic connectivity
        console.log('Testing API connection...');
        const testRes = await fetch(`${apiURL}/test`);
        console.log('Basic API test:', await testRes.json());

        // Test login
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

        if (loginData.token) {
            // Test profile
            const profileRes = await fetch(`${apiURL}/admin/profile`, {
                headers: { 'Authorization': `Bearer ${loginData.token}` }
            });
            console.log('Profile response:', await profileRes.json());
        }
    } catch (error) {
        console.error('API test failed:', error);
    }
}

testAPI(); 