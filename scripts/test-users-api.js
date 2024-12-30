require('dotenv').config();
const fetch = require('node-fetch');

async function testUsersAPI() {
    const baseURL = (process.env.VERCEL_URL || 'dallham-test5.vercel.app').replace(/\/$/, '');
    const apiURL = `https://${baseURL}/api`;

    try {
        // 1. Login first with correct password from 01_admin.sql
        console.log('\nTesting admin login...');
        const loginRes = await fetch(`${apiURL}/admin/login`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json'
            },
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

        // 2. Test get_users endpoint
        console.log('\nTesting get_users endpoint...');
        const usersRes = await fetch(`${apiURL}/admin/get_users`, {
            headers: { 
                'Authorization': `Bearer ${loginData.token}`,
                'Accept': 'application/json'
            }
        });

        const userData = await usersRes.json();
        console.log('\nUsers response:', userData);

    } catch (error) {
        console.error('Test failed:', error);
        process.exit(1);
    }
}

testUsersAPI(); 