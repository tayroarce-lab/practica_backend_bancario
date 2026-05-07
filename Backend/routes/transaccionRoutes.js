const express = require('express');
const router = express.Router();
const transaccionController = require('../controllers/transaccionController');
const { validarMonto } = require('../middlewares/validaciones');
const authorize = require('../middlewares/authorize');

// Rutas de Transacciones (/api/transacciones)
// authMiddleware ya se aplica en app.js

router.get('/', 
  authorize('admin', 'empleado', 'cliente'), 
  transaccionController.obtenerTransacciones
);

router.get('/cuenta/:cuentaId', 
  authorize('admin', 'empleado', 'cliente'), 
  transaccionController.obtenerTransaccionesPorCuenta
);

router.post('/validar-cuenta', 
  authorize('admin', 'empleado', 'cliente'), 
  transaccionController.validarCuentaDestino
);

router.post('/transferencia', 
  authorize('admin', 'empleado', 'cliente'), 
  validarMonto, 
  transaccionController.realizarTransferencia
);

module.exports = router;
