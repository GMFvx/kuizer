const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const authRoutes = require('./routes/authRoutes');
const db = require('./config/db');
const mysql = require('mysql2');
const path = require('path');

const app = express();

// Configurações do middleware
app.use(cors());
app.use(bodyParser.json());

// Conexão ao banco de dados
db.connect((err) => {
    if (err) throw err;
    console.log('Conectado ao Banco');
});

app.use(express.static(path.join(__dirname, '../FRONT/src/pages')));

// Rotas
app.use('/', authRoutes); // Prefixo "/api" para organizar as rotas

// Inicializa o servidor
app.listen(3001, () => {
    console.log('Servidor rodando na porta http://localhost:3001.');
});
