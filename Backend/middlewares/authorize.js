/**
 * Middleware de Autorización basado en roles.
 * Debe ejecutarse después del middleware de autenticación (auth.js).
 * 
 * @param {...string} rolesPermitidos - Lista de roles que tienen acceso al recurso.
 */
const authorize = (...rolesPermitidos) => {
  return (req, res, next) => {
    // 1. Verificar que req.usuario existe (inyectado por auth.js)
    if (!req.usuario) {
      return res.status(401).json({ error: 'No autenticado. Token no proporcionado o inválido.' });
    }

    // 2. Verificar si el rol del usuario está en la lista de permitidos
    if (!rolesPermitidos.includes(req.usuario.rol)) {
      return res.status(403).json({ 
        error: 'No tienes permisos para realizar esta acción. Acceso restringido por rol.' 
      });
    }

    // 3. Todo correcto, proceder al siguiente middleware o controlador
    next();
  };
};

module.exports = authorize;
