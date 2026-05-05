require('dotenv').config();
const app = require('./app');
const { testConnection } = require('./database');
const { RefreshToken } = require('./models');
const { Op } = require('sequelize');

// VALIDACIÓN AL ARRANCAR EL SERVIDOR
if (!process.env.JWT_SECRET || !process.env.JWT_REFRESH_SECRET) {
  console.error('FATAL ERROR: JWT_SECRET o JWT_REFRESH_SECRET no están definidos en las variables de entorno.');
  process.exit(1);
}

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    // Autenticar conexión a DB
    await testConnection();
    
    // Iniciar el servidor
    app.listen(PORT, () => {
      console.log(`🚀 Servidor ejecutándose en el puerto ${PORT}`);
      
      // TAREA DE LIMPIEZA AUTOMÁTICA
      // Elimina tokens expirados o usados cada 1 hora
      setInterval(async () => {
        try {
          const deleted = await RefreshToken.destroy({
            where: {
              [Op.or]: [
                { expiresAt: { [Op.lt]: new Date() } },
                { usado: true }
              ]
            }
          });
          if (deleted > 0) {
            console.log(`🧹 Limpieza: ${deleted} refresh tokens obsoletos eliminados.`);
          }
        } catch (err) {
          console.error('❌ Error en tarea de limpieza de tokens:', err);
        }
      }, 60 * 60 * 1000);
    });
  } catch (error) {
    console.error('❌ Error al iniciar el servidor:', error);
  }
};

startServer();
