require('dotenv').config();
const http = require('http');
const app = require('./app');
const { testConnection } = require('./database');
const { RefreshToken } = require('./models');
const { Op } = require('sequelize');
const socketUtils = require('./utils/socket');

// VALIDACIÓN DE VARIABLES DE ENTORNO CRÍTICAS
const requiredEnvVars = ['JWT_SECRET', 'DB_HOST', 'DB_USER', 'DB_PASS', 'DB_NAME'];
const missing = requiredEnvVars.filter(v => !process.env[v]);
if (missing.length > 0) {
  console.error(`[FATAL] Variables de entorno faltantes: ${missing.join(', ')}`);
  process.exit(1);
}

const PORT = process.env.PORT || 3000;
const server = http.createServer(app);

// Inicializar Socket.io
socketUtils.init(server);

const startServer = async () => {
  try {
    // Autenticar conexión a DB
    await testConnection();
    
    // Iniciar el servidor
    server.listen(PORT, () => {
      console.log(`🚀 Servidor con Real-time ejecutándose en el puerto ${PORT}`);
      
      // TAREA DE LIMPIEZA AUTOMÁTICA
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
