const crypto = require('crypto');

/**
 * Genera un string aleatorio criptográficamente seguro para usar como refresh token
 */
const generateRefreshToken = () => {
  return crypto.randomBytes(40).toString('hex');
};

/**
 * Retorna el hash SHA-256 de un token en claro — para almacenamiento en DB
 */
const hashToken = (plainToken) => {
  return crypto.createHash('sha256').update(plainToken).digest('hex');
};

/**
 * Calcula la fecha de expiración sumando JWT_REFRESH_EXPIRES_IN al momento actual
 * Soporta m (minutos), h (horas), d (días)
 */
const getRefreshTokenExpiry = () => {
  const config = process.env.JWT_REFRESH_EXPIRES_IN || '8h';
  const match = config.match(/^(\d+)([mhd])$/);
  
  if (!match) {
    // Default 8 horas si el formato es inválido
    return new Date(Date.now() + 8 * 60 * 60 * 1000);
  }

  const value = parseInt(match[1]);
  const unit = match[2];
  
  let ms = 0;
  switch (unit) {
    case 'm': ms = value * 60 * 1000; break;
    case 'h': ms = value * 60 * 60 * 1000; break;
    case 'd': ms = value * 24 * 60 * 60 * 1000; break;
  }

  return new Date(Date.now() + ms);
};

module.exports = {
  generateRefreshToken,
  hashToken,
  getRefreshTokenExpiry
};
