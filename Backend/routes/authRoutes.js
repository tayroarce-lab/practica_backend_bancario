const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middlewares/auth');

// Rutas Públicas
router.post('/login', authController.login);
router.post('/refresh', authController.refreshToken);

// Rutas Protegidas
router.get('/me', authMiddleware, authController.getMe);
router.post('/logout', authMiddleware, authController.logout);

module.exports = router;
