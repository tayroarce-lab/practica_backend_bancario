// Validaciones de negocio reutilizables

// Validar formato de email
const validarEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(String(email).toLowerCase());
};

// Middleware para validar creación/actualización de usuario
const validarUsuario = (req, res, next) => {
  const { email, password } = req.body;

  if (email && !validarEmail(email)) {
    return res.status(400).json({ error: 'Formato de email inválido' });
  }

  if (password && password.length < 8) {
    return res.status(400).json({ error: 'El password debe tener al menos 8 caracteres' });
  }

  next();
};

// Middleware para validar que el monto sea mayor a 0
const validarMonto = (req, res, next) => {
  const { monto } = req.body;
  if (monto === undefined || monto === null) {
    return res.status(400).json({ error: 'El monto es requerido' });
  }
  if (Number(monto) <= 0) {
    return res.status(400).json({ error: 'El monto debe ser mayor a 0' });
  }
  next();
};

// Middleware para validar creación de préstamo
const validarPrestamo = (req, res, next) => {
  const { plazoMeses, tasaInteres } = req.body;
  
  if (plazoMeses !== undefined && Number(plazoMeses) <= 0) {
    return res.status(400).json({ error: 'El plazo del préstamo debe ser mayor a 0 meses' });
  }
  
  if (tasaInteres !== undefined && Number(tasaInteres) <= 0) {
    return res.status(400).json({ error: 'La tasa de interés debe ser mayor a 0' });
  }
  
  next();
};

module.exports = {
  validarUsuario,
  validarMonto,
  validarPrestamo
};
