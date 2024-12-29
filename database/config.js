const mysql = require('mysql')

let config = {
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
    ssl: {
        rejectUnauthorized: true
    }
};

// For production database (e.g., PlanetScale, AWS RDS)
if (process.env.NODE_ENV === 'production') {
    config = {
        ...config,
        ssl: {
            rejectUnauthorized: true
        }
    };
}

const connection = mysql.createConnection(config);

connection.connect((err) => {
    if (err) {
        console.error('Error connecting to database:', err);
        return;
    }
    console.log('Connected to database');
});

module.exports = connection;