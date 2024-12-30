const { pool } = require('./config');

const query = async (sql, params) => {
    try {
        const [rows] = await pool.execute(sql, params);
        return rows;
    } catch (error) {
        console.error('Database Query Error:', error);
        throw error;
    }
};

module.exports = { query };   
