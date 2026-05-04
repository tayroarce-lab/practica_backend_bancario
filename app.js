const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// Importar Rutas
const usuarioRoutes = require('./routes/usuarioRoutes');
const cuentaRoutes = require('./routes/cuentaRoutes');
const transaccionRoutes = require('./routes/transaccionRoutes');
const prestamoRoutes = require('./routes/prestamoRoutes');

const app = express();

// Middlewares de Seguridad (Protocolo)
app.use(helmet()); // Protege las cabeceras HTTP (oculta que usas Express, previene XSS, clickjacking, etc)

// Limitador de peticiones (Previene ataques DDoS o fuerza bruta)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // Limita cada IP a 100 peticiones por ventana de 15 min
  message: { error: 'Demasiadas peticiones desde esta IP, por favor intente de nuevo después de 15 minutos.' }
});
app.use('/api/', limiter); // Aplicar solo a las rutas de la API

app.use(cors());
app.use(express.json());

// Mensaje de bienvenida en GET /
app.get('/', (req, res) => {
  res.json({ message: 'Bienvenido a la API del Sistema Bancario' });
});

// Rutas de la API
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/cuentas', cuentaRoutes);
app.use('/api/transacciones', transaccionRoutes);
app.use('/api/prestamos', prestamoRoutes);

// Manejador global de errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Ocurrió un error inesperado en el servidor' });
});

module.exports = app;
