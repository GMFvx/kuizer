const db = require('../config/db');
const bcrypt = require('bcrypt');


const jwt = require('jsonwebtoken');

// Middleware para verificar o token JWT armazenado no banco de dados
exports.verifyToken = (req, res, next) => {
    let token = req.headers['authorization'];

    if (!token) {
        return res.status(401).json({ message: 'Token não fornecido' });
    }

    // Verifica se o token tem o prefixo "Bearer " e remove se tiver
    if (token.startsWith('Bearer ')) {
        token = token.slice(7, token.length); // Remove "Bearer " do início
    }

    // Consultar o banco de dados para verificar se o token está armazenado
    db.query('SELECT * FROM cadastro WHERE token = ?', [token], (err, results) => {
        if (err || results.length === 0) {
            return res.status(403).json({ message: 'Token inválido ou expirado' });
        }

        const user = results[0];

        // Verificar a validade do token JWT
        jwt.verify(token, 'secretKey', (err, decoded) => {
            if (err) {
                return res.status(403).json({ message: 'Falha ao verificar o token' });
            }

            req.userId = decoded.id;
            next();
        });
    });
};

// Controlador do dashboard
exports.dashboard = (req, res) => {
    res.status(200).json({
        message: 'Bem-vindo ao dashboard!',
        userId: req.userId
    });
};

// Registro do usuário
exports.register = (req, res) => {
    const { name, email, password } = req.body;

    // Verifica se todos os campos necessários foram enviados
    if (!name || !email || !password) {
        return res.status(400).json({ message: 'Nome, email e senha são obrigatórios' });
    }

       // Gerar o hash da senha
       const hash = bcrypt.hashSync(password, 10);

       // Inserir o usuário no banco de dados
       db.query('INSERT INTO cadastro (name, email, password) VALUES (?, ?, ?)', [name, email, hash], (err, result) => {
           if (err) {
               return res.status(500).json({ message: 'Erro ao registrar usuário' });
           }
           res.status(200).json({ message: 'Usuário registrado com sucesso' });
       });
   };
   
   // Login do usuário
   exports.login = (req, res) => {
       const { email, password } = req.body;
   
       // Verifica se email e senha foram enviados
       if (!email || !password) {
           return res.status(400).json({ message: 'Email e senha são obrigatórios' });
       }
   
       // Consultar o banco de dados pelo email
       db.query('SELECT * FROM cadastro WHERE email = ?', [email], (err, results) => {
           if (err) {
               return res.status(500).json({ message: 'Erro ao realizar login' });
           }
   
           // Verifica se o usuário foi encontrado
           if (results.length === 0) {
               return res.status(400).json({ message: 'Usuário não encontrado' });
           }
   
           const user = results[0];
   
           // Comparar a senha fornecida com a senha armazenada no banco
           const isMatch = bcrypt.compareSync(password, user.password);
   
           if (!isMatch) {
               return res.status(400).json({ message: 'Credenciais inválidas' });
           }
   
           // Gerar um token JWT válido por 1h
           const token = jwt.sign({ id: user.id }, 'secretKey', { expiresIn: '1h' });
   
           // Armazenar o token no banco de dados
           db.query('UPDATE cadastro SET token = ? WHERE id = ?', [token, user.id], (err) => {
               if (err) {
                   return res.status(500).json({ message: 'Erro ao salvar o token no banco de dados' });
               }
   
               res.status(200).json({ message: 'Login realizado com sucesso!', token });
           });
       });
   };
   
   exports.logout = (req, res) => {
       const token = req.headers['authorization'];
   
       if (!token) {
           return res.status(400).json({ message: 'Token não fornecido' });
       }
   
       // Remover o token do banco de dados
       db.query('UPDATE cadastro SET token = NULL WHERE token = ?', [token], (err) => {
           if (err) {
               return res.status(500).json({ message: 'Erro ao realizar logout' });
           }
   
           res.status(200).json({ message: 'Logout realizado com sucesso' });
       });
   };