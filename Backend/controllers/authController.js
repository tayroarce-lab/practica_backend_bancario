const { Usuario, RefreshToken, sequelize } = require('../models');
const jwt = require('jsonwebtoken');
const { generateRefreshToken, hashToken, getRefreshTokenExpiry } = require('../utils/tokenUtils');

/**
 * Función auxiliar para generar Access Token JWT
 */
const generateAccessToken = (usuario) => {
  return jwt.sign(
    { id: usuario.id, email: usuario.email, rol: usuario.rol },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '15m' }
  );
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

    // 3. Generar Tokens
    const accessToken = generateAccessToken(usuario);
    const plainRefreshToken = generateRefreshToken();
    
    // Guardar Refresh Token hasheado en DB
    await RefreshToken.create({
      token: hashToken(plainRefreshToken),
      usuarioId: usuario.id,
      expiresAt: getRefreshTokenExpiry(),
      usado: false,
      ipOrigen: req.ip || req.headers['x-forwarded-for']
    });

    // 4. Responder con datos y tokens (en claro)
    const usuarioRespuesta = usuario.toJSON();
    delete usuarioRespuesta.password;

    res.json({
      accessToken,
      refreshToken: plainRefreshToken,
      usuario: usuarioRespuesta
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error en el servidor durante el login' });
  }
};

const refreshToken = async (req, res) => {
  try {
    const { refreshToken: plainRefreshToken } = req.body;

    if (!plainRefreshToken) {
      return res.status(400).json({ error: 'Refresh token no proporcionado' });
    }

    const hashedToken = hashToken(plainRefreshToken);

    // Buscar el token en DB incluyendo al usuario
    const storedToken = await RefreshToken.findOne({
      where: { token: hashedToken },
      include: [{ model: Usuario, as: 'usuario' }]
    });

    if (!storedToken) {
      return res.status(401).json({ error: 'Token inválido' });
    }

    // DETECCIÓN DE REUTILIZACIÓN (ROBO DE TOKEN)
    if (storedToken.usado) {
      // Si el token ya fue usado, invalidamos TODAS las sesiones del usuario por seguridad
      await RefreshToken.destroy({ where: { usuarioId: storedToken.usuarioId } });
      return res.status(401).json({ error: 'Token ya utilizado, sesión invalidada por seguridad' });
    }

    // VERIFICAR EXPIRACIÓN
    if (storedToken.expiresAt < new Date()) {
      return res.status(401).json({ error: 'Sesión expirada, inicia sesión nuevamente' });
    }

    // VERIFICAR USUARIO ACTIVO
    if (!storedToken.usuario || !storedToken.usuario.activo) {
      return res.status(401).json({ error: 'Usuario no encontrado o inactivo' });
    }

    // MARCAR TOKEN ACTUAL COMO USADO
    await storedToken.update({ usado: true });

    // ROTACIÓN DE TOKENS
    const newAccessToken = generateAccessToken(storedToken.usuario);
    const newPlainRefreshToken = generateRefreshToken();

    // Guardar el nuevo refresh token hasheado
    await RefreshToken.create({
      token: hashToken(newPlainRefreshToken),
      usuarioId: storedToken.usuarioId,
      expiresAt: getRefreshTokenExpiry(),
      usado: false,
      ipOrigen: req.ip || req.headers['x-forwarded-for']
    });

    res.json({
      accessToken: newAccessToken,
      refreshToken: newPlainRefreshToken
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al refrescar el token' });
  }
};

const logout = async (req, res) => {
  try {
    // Eliminar todos los refresh tokens del usuario autenticado
    await RefreshToken.destroy({
      where: { usuarioId: req.usuario.id }
    });

    res.json({ message: 'Sesión cerrada correctamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al cerrar la sesión' });
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
  logout,
  getMe
};
