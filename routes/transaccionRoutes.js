const express = require('express');
const router = express.Router();
const transaccionController = require('../controllers/transaccionController');
const { validarMonto } = require('../middlewares/validaciones');

// Rutas de Transacciones (/api/transacciones)
router.get('/', transaccionController.obtenerTransacciones);
router.get('/cuenta/:cuentaId', transaccionController.obtenerTransaccionesPorCuenta);
router.post('/transferencia', validarMonto, transaccionController.realizarTransferencia);

module.exports = router;
