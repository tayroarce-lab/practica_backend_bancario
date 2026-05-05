const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Acceso denegado. No hay token.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    // Usar exclusivamente el secret de las variables de entorno
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // req.usuario incluirá { id, email, rol } según lo definido en el controller
    req.usuario = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Token inválido o expirado' });
  }
};

module.exports = authMiddleware;
