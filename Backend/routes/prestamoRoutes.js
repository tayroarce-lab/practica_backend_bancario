const express = require('express');
const router = express.Router();
const prestamoController = require('../controllers/prestamoController');
const { validarMonto, validarPrestamo } = require('../middlewares/validaciones');
const authorize = require('../middlewares/authorize');

// Rutas de Préstamos (/api/prestamos)
// authMiddleware ya se aplica en app.js

router.get('/', 
  authorize('admin', 'empleado', 'cliente'), 
  prestamoController.obtenerPrestamos
);

router.get('/usuario/:usuarioId', 
  authorize('admin', 'empleado', 'cliente'), 
  prestamoController.obtenerPrestamosPorUsuario
);

router.post('/', 
  authorize('admin', 'empleado', 'cliente'), 
  validarMonto, 
  validarPrestamo, 
  prestamoController.solicitarPrestamo
);

router.put('/:id/aprobar', 
  authorize('admin', 'empleado'), 
  prestamoController.aprobarPrestamo
);

router.put('/:id/rechazar', 
  authorize('admin', 'empleado'), 
  prestamoController.rechazarPrestamo
);

module.exports = router;
