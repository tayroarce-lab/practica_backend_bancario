const express = require('express');
const router = express.Router();
const cuentaController = require('../controllers/cuentaController');
const { validarMonto } = require('../middlewares/validaciones');

// Rutas de Cuentas (/api/cuentas)
router.get('/', cuentaController.obtenerCuentas);
router.get('/:id', cuentaController.obtenerCuentaPorId);
router.get('/usuario/:usuarioId', cuentaController.obtenerCuentasPorUsuario);
router.post('/', cuentaController.crearCuenta);
router.put('/:id/estado', cuentaController.actualizarEstadoCuenta);
router.post('/:id/deposito', validarMonto, cuentaController.depositarFondos);
router.post('/:id/retiro', validarMonto, cuentaController.retirarFondos);

module.exports = router;
