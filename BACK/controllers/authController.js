const db = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Registro do usuário
exports.register = (req, res) => {
    const { name, email, password } = req.body;
    console.log('Dados recebidos para registro:', name, email, password);

    if (!name || !email || !password) {
        console.log('Dados incompletos para registro');
        return res.status(400).json({ message: 'Nome, email e senha são obrigatórios' });
    }

    const hash = bcrypt.hashSync(password, 10);
    const sql = 'INSERT INTO cadastro (name, email, password) VALUES (?, ?, ?)';
    console.log('SQL para registro:', sql);

    db.query(sql, [name, email, hash], (err, result) => {
        if (err) {
            console.error('Erro ao registrar usuário:', err);
            return res.status(500).json({ message: 'Erro ao registrar usuário' });
        }
        console.log('Registro bem-sucedido:', result);
        res.status(200).json({ message: 'Usuário registrado com sucesso' });
    });
};

// Login do usuário
exports.login = (req, res) => {
    const { email, password } = req.body;
    console.log('Dados recebidos para login:', email, password);

    if (!email || !password) {
        return res.status(400).json({ message: 'Email e senha são obrigatórios' });
    }

    const sql = 'SELECT * FROM cadastro WHERE email = ?';
    console.log('SQL para login:', sql);

    db.query(sql, [email], (err, results) => {
        if (err) {
            console.error('Erro ao realizar login:', err);
            return res.status(500).json({ message: 'Erro ao realizar login' });
        }

        if (results.length === 0) {
            return res.status(400).json({ message: 'Usuário não encontrado' });
        }

        const user = results[0];
        const isMatch = bcrypt.compareSync(password, user.password);
        console.log('Senha correspondente:', isMatch);

        if (!isMatch) {
            return res.status(400).json({ message: 'Credenciais inválidas' });
        }

        const token = jwt.sign({ id: user.id }, 'secretKey', { expiresIn: '1h' });
        console.log('Token gerado:', token);

        res.status(200).json({ message: 'Login realizado com sucesso!', token, redirectUrl: '/home2.html' });
    });
};

// Logout
exports.logout = (req, res) => {
    let token = req.headers['authorization'];
    console.log('Token recebido para logout:', token);

    if (!token) {
        return res.status(400).json({ message: 'Token não fornecido' });
    }

    if (token.startsWith('Bearer ')) {
        token = token.slice(7, token.length);
    }

    db.query('UPDATE cadastro SET token = NULL WHERE token = ?', [token], (err) => {
        if (err) {
            return res.status(500).json({ message: 'Erro ao realizar logout' });
        }

        res.status(200).json({ message: 'Logout realizado com sucesso' });
    });
};

// Middleware para verificar o token JWT
exports.verifyToken = (req, res, next) => {
    const token = req.headers['authorization'];
    console.log('Token recebido para verificação:', token);

    if (!token) {
        return res.status(403).json({ message: 'Token não fornecido' });
    }

    if (token.startsWith('Bearer ')) {
        token = token.slice(7, token.length);
    }

    jwt.verify(token, 'secretKey', (err, decoded) => {
        if (err) {
            return res.status(500).json({ message: 'Token inválido' });
        }
        req.userId = decoded.id;
        next();
    });
};

// Obter resultados do usuário
// Obter resultados do usuário e nome
exports.getUserResults = (req, res) => {
    const userId = req.userId;

    const sql = `
        SELECT qr.id, q.title as quiz_title, qr.score, qr.quiz_date, u.name
        FROM user_results qr
        JOIN quizzes q ON qr.quiz_id = q.id
        JOIN users u ON qr.user_id = u.id
        WHERE qr.user_id = ?`;

    db.query(sql, [userId], (err, results) => {
        if (err) {
            console.error('Erro ao obter resultados do usuário:', err);
            return res.status(500).json({ message: 'Erro ao obter resultados do usuário' });
        }
        if (results.length > 0) {
            res.status(200).json({ userName: results[0].name, quizzes: results });
        } else {
            res.status(200).json({ userName: '', quizzes: [] });
        }
    });
};
