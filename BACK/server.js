require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const authRoutes = require('./routes/authRoutes');
const db = require('./config/db');

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../FRONT/src/pages')));
app.use('/', authRoutes);

app.listen(3000, () => {
    console.log('Servidor rodando na porta http://localhost:3000.');
});
