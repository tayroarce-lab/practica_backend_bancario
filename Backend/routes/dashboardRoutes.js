const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');

// Rutas de Dashboard (/api/dashboard)
// authMiddleware se aplica en app.js para todas las rutas de dashboard
// Acceso: todos los roles autenticados (admin, empleado, cliente)

router.get('/stats', dashboardController.getStats);
router.get('/chart', dashboardController.getChart);

module.exports = router;
