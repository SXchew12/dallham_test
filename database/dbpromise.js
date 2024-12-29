const { pool } = require('./config');

function query(sql, arr) {
    return new Promise((resolve, reject) => {
        if (!sql || !arr) {
            return resolve("No sql provided");
        }
        
        pool.getConnection((err, connection) => {
            if (err) {
                console.error('Connection error:', err);
                reject(err);
                return;
            }

            connection.query(sql, arr, (error, results) => {
                connection.release();
                
                if (error) {
                    console.error('Query error:', error);
                    reject(error);
                    return;
                }
                
                resolve(results);
            });
        });
    });
}

exports.query = query;   
