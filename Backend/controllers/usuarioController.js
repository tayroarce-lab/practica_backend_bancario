const { Usuario, Cuenta } = require('../models');

// Crear usuario
const crearUsuario = async (req, res) => {
  try {
    const { nombre, apellido, email, password, telefono, dui, fechaNacimiento, rol } = req.body;

    // REGLA DE NEGOCIO: Empleado solo puede crear clientes
    // Un admin puede crear cualquier rol (admin, empleado, cliente)
    if (req.usuario.rol === 'empleado' && rol && rol !== 'cliente') {
      return res.status(403).json({ error: 'Un empleado solo puede registrar usuarios con el rol "cliente"' });
    }

    // Verificar email único
    const existeEmail = await Usuario.findOne({ where: { email } });
    if (existeEmail) {
      return res.status(409).json({ error: 'El email ya está en uso' });
    }

    // Verificar DUI único si se envía
    if (dui) {
      const existeDui = await Usuario.findOne({ where: { dui } });
      if (existeDui) {
        return res.status(409).json({ error: 'El DUI ya está registrado' });
      }
    }

    // Crear el usuario. El hook de bcrypt encriptará la contraseña.
    const usuario = await Usuario.create({
      nombre, apellido, email, password, telefono, dui, fechaNacimiento, rol: rol || 'cliente'
    });

    // Remover la contraseña de la respuesta
    const usuarioRespuesta = usuario.toJSON();
    delete usuarioRespuesta.password;

    res.status(201).json(usuarioRespuesta);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al crear el usuario' });
  }
};

// Obtener todos los usuarios (excluyendo contraseñas e incluyendo cuentas)
const obtenerUsuarios = async (req, res) => {
  try {
    const usuarios = await Usuario.findAll({
      attributes: { exclude: ['password'] },
      include: [{
        model: Cuenta,
        as: 'cuentas'
      }]
    });
    res.json(usuarios);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener usuarios' });
  }
};

// Obtener un usuario por ID
const obtenerUsuarioPorId = async (req, res) => {
  try {
    const { id } = req.params;

    // RESTRICCIÓN: Cliente solo puede ver su propio ID
    if (req.usuario.rol === 'cliente' && req.usuario.id !== parseInt(id)) {
      return res.status(403).json({ error: 'No tienes permisos para ver los datos de otro usuario' });
    }

    const usuario = await Usuario.findByPk(id, {
      attributes: { exclude: ['password'] },
      include: [{
        model: Cuenta,
        as: 'cuentas'
      }]
    });

    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json(usuario);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener el usuario' });
  }
};

// Actualizar usuario
const actualizarUsuario = async (req, res) => {
  try {
    const { id } = req.params;

    // RESTRICCIÓN: Cliente solo puede actualizar su propio perfil
    if (req.usuario.rol === 'cliente' && req.usuario.id !== parseInt(id)) {
      return res.status(403).json({ error: 'No tienes permisos para actualizar el perfil de otro usuario' });
    }

    const { email, dui } = req.body;

    const usuario = await Usuario.findByPk(id);
    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Validar email si cambia
    if (email && email !== usuario.email) {
      const existeEmail = await Usuario.findOne({ where: { email } });
      if (existeEmail) {
        return res.status(409).json({ error: 'El email ya está en uso por otro usuario' });
      }
    }

    // Validar DUI si cambia
    if (dui && dui !== usuario.dui) {
      const existeDui = await Usuario.findOne({ where: { dui } });
      if (existeDui) {
        return res.status(409).json({ error: 'El DUI ya está en uso por otro usuario' });
      }
    }

    // Actualizar datos. El hook beforeUpdate re-encriptará si la password viene en el body
    await usuario.update(req.body);

    const usuarioRespuesta = usuario.toJSON();
    delete usuarioRespuesta.password;

    res.json(usuarioRespuesta);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al actualizar el usuario' });
  }
};

// Eliminar usuario (Soft Delete)
const eliminarUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    const usuario = await Usuario.findByPk(id);

    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Cambiar estado activo a false en lugar de borrar físicamente
    await usuario.update({ activo: false });

    res.json({ message: 'Usuario desactivado correctamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al eliminar el usuario' });
  }
};

// Cambiar rol de usuario (Solo Admin)
const cambiarRol = async (req, res) => {
  try {
    const { id } = req.params;
    const { rol } = req.body;
    const rolesValidos = ['admin', 'empleado', 'cliente'];

    if (!rolesValidos.includes(rol)) {
      return res.status(400).json({ error: `Rol inválido. Valores permitidos: ${rolesValidos.join(', ')}` });
    }

    const usuario = await Usuario.findByPk(id);
    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    await usuario.update({ rol });

    res.json({ 
      message: 'Rol actualizado correctamente', 
      usuario: { id: usuario.id, email: usuario.email, rol: usuario.rol } 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al cambiar el rol' });
  }
};

module.exports = {
  crearUsuario,
  obtenerUsuarios,
  obtenerUsuarioPorId,
  actualizarUsuario,
  eliminarUsuario,
  cambiarRol
};
