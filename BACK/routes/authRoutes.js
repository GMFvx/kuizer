const express = require('express');
const authController = require('../controllers/authController');

const router = express.Router();

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/dashboard', authController.verifyToken, authController.dashboard); // Protegendo a rota dashboard

module.exports = router;