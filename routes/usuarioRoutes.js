const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuarioController');
const { validarUsuario } = require('../middlewares/validaciones');

// Rutas de Usuarios (/api/usuarios)
router.get('/', usuarioController.obtenerUsuarios);
router.get('/:id', usuarioController.obtenerUsuarioPorId);
router.post('/', validarUsuario, usuarioController.crearUsuario);
router.put('/:id', validarUsuario, usuarioController.actualizarUsuario);
router.delete('/:id', usuarioController.eliminarUsuario);

module.exports = router;
