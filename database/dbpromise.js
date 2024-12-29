const con = require('./config')

function query(sql, arr) {
    return new Promise((resolve, reject) => {
        if (!sql || !arr) {
            return resolve("No sql provided")
        }
        
        // Add retry logic
        const tryQuery = (retries = 3) => {
            con.query(sql, arr, (err, result) => {
                if (err) {
                    console.error('Query error:', err);
                    if (retries > 0 && (err.code === 'PROTOCOL_CONNECTION_LOST' || err.code === 'PROTOCOL_ENQUEUE_AFTER_FATAL_ERROR')) {
                        console.log(`Retrying query... (${retries} attempts left)`);
                        setTimeout(() => tryQuery(retries - 1), 1000);
                    } else {
                        reject(err);
                    }
                } else {
                    resolve(result);
                }
            });
        };
        
        tryQuery();
    });
}

exports.query = query;   
