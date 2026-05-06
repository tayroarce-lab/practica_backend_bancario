const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  let token = null;

  // 1. Intentar obtener de cookies (Prioridad)
  if (req.cookies && req.cookies.accessToken) {
    token = req.cookies.accessToken;
  } 
  // 2. Intentar obtener de header Authorization (Fallback para herramientas externas)
  else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ error: 'Acceso denegado. No hay sesión activa.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.usuario = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Sesión expirada o inválida' });
  }
};

module.exports = authMiddleware;
