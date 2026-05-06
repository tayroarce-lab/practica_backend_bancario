const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuarioController');
const { validarUsuario } = require('../middlewares/validaciones');
const authorize = require('../middlewares/authorize');

// Rutas de Usuarios (/api/usuarios)
// authMiddleware ya se aplica en app.js para todas estas rutas

router.get('/', 
  authorize('admin', 'empleado'), 
  usuarioController.obtenerUsuarios
);

router.get('/:id', 
  authorize('admin', 'empleado', 'cliente'), 
  usuarioController.obtenerUsuarioPorId
);

router.post('/', 
  authorize('admin'), 
  validarUsuario, 
  usuarioController.crearUsuario
);

router.put('/:id', 
  authorize('admin', 'cliente'), 
  validarUsuario, 
  usuarioController.actualizarUsuario
);

router.delete('/:id', 
  authorize('admin'), 
  usuarioController.eliminarUsuario
);

// Gestión de Roles (Solo Admin)
router.put('/:id/rol',
  authorize('admin'),
  usuarioController.cambiarRol
);

module.exports = router;
