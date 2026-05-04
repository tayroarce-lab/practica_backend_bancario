require('dotenv').config();
const app = require('./app');
const { testConnection } = require('./database');
// Importar los modelos para que se sincronicen (si no se usan migraciones). En este caso usaremos migraciones,
// pero cargar los modelos aquí asegura que las relaciones se inicialicen correctamente.
const db = require('./models');

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    // Autenticar conexión a DB
    await testConnection();
    
    // Iniciar el servidor
    app.listen(PORT, () => {
      console.log(`🚀 Servidor ejecutándose en el puerto ${PORT}`);
    });
  } catch (error) {
    console.error('❌ Error al iniciar el servidor:', error);
  }
};

startServer();
