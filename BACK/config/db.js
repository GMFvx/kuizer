const db = mysql2.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'kuizer'
});

module.exports = db;