const { Usuario } = require('../models');
const jwt = require('jsonwebtoken');

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Buscar usuario
    const usuario = await Usuario.findOne({ where: { email, activo: true } });
    if (!usuario) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    // 2. Validar contraseña
    const esValido = await usuario.validarPassword(password);
    if (!esValido) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    // 3. Generar JWT
    const token = jwt.sign(
      { id: usuario.id, email: usuario.email },
      process.env.JWT_SECRET || 'secret_para_desarrollo_old_money',
      { expiresIn: '8h' }
    );

    // 4. Responder con datos y token
    const usuarioRespuesta = usuario.toJSON();
    delete usuarioRespuesta.password;

    res.json({
      token,
      usuario: usuarioRespuesta
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error en el servidor durante el login' });
  }
};

const getMe = async (req, res) => {
  try {
    const usuario = await Usuario.findByPk(req.usuario.id, {
      attributes: { exclude: ['password'] }
    });
    res.json(usuario);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener sesión' });
  }
};

module.exports = {
  login,
  getMe
};
