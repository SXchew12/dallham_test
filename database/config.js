const mysql = require('mysql')

let config = {
    host: process.env.DBHOST,
    user: process.env.DBUSER,
    password: process.env.DBPASS,
    database: process.env.DBNAME,
    port: process.env.DBPORT || 3306,
    connectionLimit: 10,
    connectTimeout: 60000
};

// Only add SSL for production
if (process.env.NODE_ENV === 'production') {
    config.ssl = {
        rejectUnauthorized: false // Changed this to false for development
    };
}

const connection = mysql.createConnection(config);

// Add error handling and reconnection logic
connection.on('error', function(err) {
    console.error('Database error:', err);
    if (err.code === 'PROTOCOL_CONNECTION_LOST') {
        console.log('Reconnecting to database...');
        connection.connect();
    } else {
        throw err;
    }
});

connection.connect((err) => {
    if (err) {
        console.error('Error connecting to database:', err);
        return;
    }
    console.log('Connected to database successfully');
});

module.exports = connection;