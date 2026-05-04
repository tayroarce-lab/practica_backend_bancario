const express = require('express');
const router = express.Router();
const prestamoController = require('../controllers/prestamoController');
const { validarMonto, validarPrestamo } = require('../middlewares/validaciones');

// Rutas de Préstamos (/api/prestamos)
router.get('/', prestamoController.obtenerPrestamos);
router.get('/usuario/:usuarioId', prestamoController.obtenerPrestamosPorUsuario);
router.post('/', validarMonto, validarPrestamo, prestamoController.solicitarPrestamo);
router.put('/:id/aprobar', prestamoController.aprobarPrestamo);
router.put('/:id/rechazar', prestamoController.rechazarPrestamo);

module.exports = router;
