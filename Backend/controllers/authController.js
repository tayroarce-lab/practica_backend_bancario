const { Usuario } = require('../models');
const jwt = require('jsonwebtoken');

/**
 * Función auxiliar para generar tokens
 */
const generarTokens = (usuario) => {
  const payload = { 
    id: usuario.id, 
    email: usuario.email, 
    rol: usuario.rol 
  };

  const accessToken = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '8h'
  });

  const refreshToken = jwt.sign({ id: usuario.id }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d'
  });

  return { accessToken, refreshToken };
};

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

    // 3. Generar Tokens (Access + Refresh)
    const { accessToken, refreshToken } = generarTokens(usuario);

    // 4. Responder con datos y tokens
    const usuarioRespuesta = usuario.toJSON();
    delete usuarioRespuesta.password;

    res.json({
      token: accessToken,
      refreshToken,
      usuario: usuarioRespuesta
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error en el servidor durante el login' });
  }
};

const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({ error: 'Token de refresco no proporcionado' });
    }

    // Verificar el refresh token
    let decoded;
    try {
      decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    } catch (err) {
      return res.status(401).json({ error: 'Token de refresco inválido o expirado' });
    }

    // Buscar usuario para obtener su rol actual
    const usuario = await Usuario.findByPk(decoded.id);
    if (!usuario || !usuario.activo) {
      return res.status(401).json({ error: 'Usuario no encontrado o inactivo' });
    }

    // Generar solo un nuevo access token
    const payload = { 
      id: usuario.id, 
      email: usuario.email, 
      rol: usuario.rol 
    };
    
    const accessToken = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '8h'
    });

    res.json({ token: accessToken });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al refrescar el token' });
  }
};

const getMe = async (req, res) => {
  try {
    const usuario = await Usuario.findByPk(req.usuario.id, {
      attributes: { exclude: ['password'] }
    });
    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    res.json(usuario);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener sesión' });
  }
};

module.exports = {
  login,
  refreshToken,
  getMe
};
