const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

// VALIDACIÓN CRÍTICA DE SEGURIDAD: Verificar secretos de JWT al arrancar
if (!process.env.JWT_SECRET || !process.env.JWT_REFRESH_SECRET) {
  console.error('FATAL ERROR: JWT_SECRET o JWT_REFRESH_SECRET no están definidos en las variables de entorno.');
  process.exit(1);
}

// Importar Rutas
const usuarioRoutes = require('./routes/usuarioRoutes');
const cuentaRoutes = require('./routes/cuentaRoutes');
const transaccionRoutes = require('./routes/transaccionRoutes');
const prestamoRoutes = require('./routes/prestamoRoutes');
const authRoutes = require('./routes/authRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const authMiddleware = require('./middlewares/auth');

const app = express();

// 1. CORS - Debe ir ANTES de cualquier otro middleware para manejar Preflight (OPTIONS)
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// 2. Seguridad de Cabeceras
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" } // Permite compartir recursos entre orígenes
}));

// 3. Otros Middlewares Globales
app.use(cookieParser());
app.use(express.json());

// 4. Rate Limiting - Ajustado para desarrollo
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // Reducido a 1 minuto
  max: process.env.NODE_ENV === 'development' ? 1000 : 100, // 1000 peticiones por minuto en dev
  message: { error: 'Demasiadas peticiones desde esta IP. Por favor, espere un minuto.' },
  standardHeaders: true, // Retorna info en cabeceras `RateLimit-*`
  legacyHeaders: false,
});
app.use('/api/', limiter);

// Rate Limiting estricto para autenticación (10 intentos / 15 min)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'development' ? 100 : 10,
  message: { error: 'Demasiados intentos de login. Por favor, espere 15 minutos.' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/auth/login', authLimiter);

// Mensaje de bienvenida en GET /
app.get('/', (req, res) => {
  res.json({ message: 'Bienvenido a la API del Sistema Bancario' });
});

// Rutas de la API
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', authMiddleware, dashboardRoutes);
app.use('/api/usuarios', authMiddleware, usuarioRoutes);
app.use('/api/cuentas', authMiddleware, cuentaRoutes);
app.use('/api/transacciones', authMiddleware, transaccionRoutes);
app.use('/api/prestamos', authMiddleware, prestamoRoutes);

// Manejador global de errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Ocurrió un error inesperado en el servidor' });
});

module.exports = app;
