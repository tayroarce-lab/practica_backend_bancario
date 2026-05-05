const express = require('express');
const router = express.Router();
const cuentaController = require('../controllers/cuentaController');
const { validarMonto } = require('../middlewares/validaciones');
const authorize = require('../middlewares/authorize');

// Rutas de Cuentas (/api/cuentas)
// authMiddleware ya se aplica en app.js

router.get('/', 
  authorize('admin', 'empleado'), 
  cuentaController.obtenerCuentas
);

router.get('/:id', 
  authorize('admin', 'empleado', 'cliente'), 
  cuentaController.obtenerCuentaPorId
);

router.get('/usuario/:usuarioId', 
  authorize('admin', 'empleado', 'cliente'), 
  cuentaController.obtenerCuentasPorUsuario
);

router.post('/', 
  authorize('admin', 'empleado'), 
  cuentaController.crearCuenta
);

router.put('/:id/estado', 
  authorize('admin', 'empleado'), 
  cuentaController.actualizarEstadoCuenta
);

router.post('/:id/deposito', 
  authorize('admin', 'empleado'), 
  validarMonto, 
  cuentaController.depositarFondos
);

router.post('/:id/retiro', 
  authorize('admin', 'empleado'), 
  validarMonto, 
  cuentaController.retirarFondos
);

module.exports = router;
