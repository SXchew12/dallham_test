require('dotenv').config();
const { query } = require('../database/dbpromise');

async function verifyContent() {
    try {
        // Check page content
        const pages = await query('SELECT * FROM page');
        console.log('\nPage Content Verification:');
        for (const page of pages) {
            console.log(`\nPage: ${page.title}`);
            console.log('- Slug:', page.slug);
            console.log('- Content Length:', page.content?.length || 0);
            console.log('- Content Preview:', page.content?.substring(0, 100) + '...');
        }

        // Check other HTML content
        const tables = ['faq', 'web_public'];
        for (const table of tables) {
            console.log(`\n${table} Content:`);
            const rows = await query(`SELECT * FROM ${table} LIMIT 3`);
            rows.forEach((row, i) => {
                console.log(`\nRecord ${i + 1}:`);
                Object.entries(row).forEach(([key, value]) => {
                    if (typeof value === 'string' && value.includes('<')) {
                        console.log(`- ${key}: ${value.substring(0, 50)}...`);
                    }
                });
            });
        }

    } catch (error) {
        console.error('Verification failed:', error);
        process.exit(1);
    }
}

verifyContent().then(() => {
    console.log('\nContent verification complete');
}).catch(err => {
    console.error('Failed:', err);
    process.exit(1);
}); 