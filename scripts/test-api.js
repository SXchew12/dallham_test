require('dotenv').config();
const fetch = require('node-fetch');

async function testAPI() {
    // Remove trailing slash from VERCEL_URL if present
    const baseURL = (process.env.VERCEL_URL || 'dallham-test5.vercel.app').replace(/\/$/, '');
    const apiURL = `https://${baseURL}/api`;

    try {
        console.log('Testing API at:', apiURL);
        
        // Test 1: Admin Login
        console.log('\nTesting Admin Login...');
        const loginRes = await fetch(`${apiURL}/admin/login`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                email: 'admin@admin.com',
                password: 'password'
            })
        });

        // Log the raw response for debugging
        const rawResponse = await loginRes.text();
        console.log('Raw response:', rawResponse);
        
        let loginData;
        try {
            loginData = JSON.parse(rawResponse);
        } catch (e) {
            throw new Error(`Invalid JSON response: ${rawResponse}`);
        }
        
        console.log('Login response:', loginData);

        if (!loginData.success) {
            throw new Error(`Login failed: ${loginData.msg}`);
        }

        // Test 2: Get Admin Profile with token
        if (loginData.token) {
            console.log('\nTesting Admin Profile...');
            const profileRes = await fetch(`${apiURL}/admin/profile`, {
                headers: { 
                    'Authorization': `Bearer ${loginData.token}`,
                    'Accept': 'application/json'
                }
            });
            const profileData = await profileRes.json();
            console.log('Profile response:', profileData);
        }

        return loginData;
    } catch (error) {
        console.error('API Test Failed:', error);
        throw error;
    }
}

// Run the test
testAPI().catch(error => {
    console.error('Test failed:', error.message);
    process.exit(1);
}); 