import { query } from '../../../database/dbpromise';

export default async function handler(req, res) {
    try {
        // Check critical tables
        const tables = ['admin', 'user', 'plan', 'settings'];
        const results = {};

        for (const table of tables) {
            const [rows] = await query(`SELECT COUNT(*) as count FROM ${table}`);
            results[table] = {
                count: rows[0].count,
                sample: await query(`SELECT * FROM ${table} LIMIT 1`)
            };
        }

        res.status(200).json({
            success: true,
            message: 'Database verification complete',
            results
        });
    } catch (error) {
        console.error('Database verification failed:', error);
        res.status(500).json({
            success: false,
            message: 'Database verification failed',
            error: error.message
        });
    }
} 