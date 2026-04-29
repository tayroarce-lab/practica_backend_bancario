// FILE: database.js
/**
 * Instancia principal de Sequelize.
 * Carga las variables de entorno, crea la conexión a MySQL
 * y verifica la conectividad con authenticate().
 */
require('dotenv').config();
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT, 10),
    dialect: process.env.DB_DIALECT || 'mysql',
    define: {
      charset: 'utf8mb4',
      collate: 'utf8mb4_unicode_ci',
      underscored: true,
      timestamps: true,
    },
    logging: false,
  }
);

sequelize
  .authenticate()
  .then(() => {
    console.log('✅ Conexión a la base de datos establecida correctamente.');
  })
  .catch((error) => {
    console.error('❌ No se pudo conectar a la base de datos:', error.message);
  });

module.exports = sequelize;
