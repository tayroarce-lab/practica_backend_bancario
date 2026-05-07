const { Usuario, Cuenta, Transaccion, Prestamo, TipoCuenta, sequelize } = require('../models');
const { Op } = require('sequelize');

/**
 * GET /api/dashboard/stats
 * Retorna estadísticas adaptadas al rol del usuario autenticado.
 */
const getStats = async (req, res) => {
  try {
    const { id: userId, rol } = req.usuario;
    const isAdmin = rol === 'admin' || rol === 'empleado';

    if (isAdmin) {
      // ── Vista Administrativa ──────────────────────────────────────
      const hoyInicio = new Date();
      hoyInicio.setHours(0, 0, 0, 0);
      const hoyFin = new Date();
      hoyFin.setHours(23, 59, 59, 999);

      const [
        totalUsuarios,
        totalCuentas,
        saldoData,
        transaccionesHoy,
        prestamosPendientes,
        recentTxs
      ] = await Promise.all([
        Usuario.count({ where: { activo: true } }),
        Cuenta.count({ where: { estado: 'activa' } }),
        Cuenta.findAll({
          where: { estado: 'activa' },
          attributes: [[sequelize.fn('SUM', sequelize.col('saldo')), 'total']]
        }),
        Transaccion.count({
          where: { fecha: { [Op.between]: [hoyInicio, hoyFin] } }
        }),
        Prestamo.count({ where: { estado: 'pendiente' } }),
        Transaccion.findAll({
          include: [
            {
              model: Cuenta, as: 'cuentaOrigen',
              attributes: ['numeroCuenta'],
              include: [{ model: Usuario, as: 'usuario', attributes: ['nombre', 'apellido'] }]
            },
            {
              model: Cuenta, as: 'cuentaDestino',
              attributes: ['numeroCuenta'],
              include: [{ model: Usuario, as: 'usuario', attributes: ['nombre', 'apellido'] }]
            }
          ],
          order: [['fecha', 'DESC']],
          limit: 5
        })
      ]);

      const saldoTotal = parseFloat(saldoData[0]?.getDataValue('total') || 0);

      return res.json({
        rol: 'admin',
        stats: {
          totalUsuarios,
          totalCuentas,
          saldoTotal,
          transaccionesHoy,
          prestamosPendientes
        },
        recentTxs
      });

    } else {
      // ── Vista Cliente ─────────────────────────────────────────────
      const hoyInicio = new Date();
      hoyInicio.setHours(0, 0, 0, 0);
      const hoyFin = new Date();
      hoyFin.setHours(23, 59, 59, 999);

      // 1. Sus cuentas
      const misCuentas = await Cuenta.findAll({
        where: { usuarioId: userId },
        include: [{ model: TipoCuenta, as: 'tipoCuenta', attributes: ['nombre'] }]
      });

      const idsCuentas = misCuentas.map(c => c.id);
      const miSaldoTotal = misCuentas.reduce((acc, c) => acc + Number(c.saldo), 0);

      // 2. Sus transacciones recientes
      const [misTransacciones, misPrestamos] = await Promise.all([
        idsCuentas.length > 0 ? Transaccion.findAll({
          where: {
            [Op.or]: [
              { cuentaOrigenId: { [Op.in]: idsCuentas } },
              { cuentaDestinoId: { [Op.in]: idsCuentas } }
            ]
          },
          include: [
            { model: Cuenta, as: 'cuentaOrigen', attributes: ['numeroCuenta'] },
            { model: Cuenta, as: 'cuentaDestino', attributes: ['numeroCuenta'] }
          ],
          order: [['fecha', 'DESC']],
          limit: 5
        }) : Promise.resolve([]),
        Prestamo.findAll({
          where: { usuarioId: userId },
          order: [['createdAt', 'DESC']]
        })
      ]);

      const transaccionesHoy = idsCuentas.length > 0 ? await Transaccion.count({
        where: {
          fecha: { [Op.between]: [hoyInicio, hoyFin] },
          [Op.or]: [
            { cuentaOrigenId: { [Op.in]: idsCuentas } },
            { cuentaDestinoId: { [Op.in]: idsCuentas } }
          ]
        }
      }) : 0;

      return res.json({
        rol: 'cliente',
        stats: {
          totalCuentas: misCuentas.length,
          miSaldoTotal,
          prestamosActivos: misPrestamos.filter(p => p.estado === 'aprobado').length,
          transaccionesHoy
        },
        misCuentas,
        recentTxs: misTransacciones,
        misPrestamos
      });
    }
  } catch (error) {
    console.error('Error en getStats:', error);
    res.status(500).json({ error: 'Error al obtener estadísticas del dashboard' });
  }
};

/**
 * GET /api/dashboard/chart
 * Retorna datos agrupados por día para el AreaChart, últimos 30 días.
 */
const getChart = async (req, res) => {
  try {
    const { id: userId, rol } = req.usuario;
    const isAdmin = rol === 'admin' || rol === 'empleado';

    const hace30dias = new Date();
    hace30dias.setDate(hace30dias.getDate() - 30);

    let whereClause = { fecha: { [Op.gte]: hace30dias } };

    if (!isAdmin) {
      // Filtrar por cuentas del usuario
      const cuentas = await Cuenta.findAll({
        where: { usuarioId: userId },
        attributes: ['id']
      });
      const idsCuentas = cuentas.map(c => c.id);

      if (idsCuentas.length === 0) {
        return res.json([]);
      }

      whereClause[Op.or] = [
        { cuentaOrigenId: { [Op.in]: idsCuentas } },
        { cuentaDestinoId: { [Op.in]: idsCuentas } }
      ];
    }

    const transacciones = await Transaccion.findAll({
      where: whereClause,
      attributes: ['monto', 'fecha'],
      order: [['fecha', 'ASC']]
    });

    // Agrupar por día
    const grouped = transacciones.reduce((acc, tx) => {
      const date = new Date(tx.fecha).toLocaleDateString('es-ES', {
        day: '2-digit',
        month: 'short'
      });
      acc[date] = (acc[date] || 0) + Number(tx.monto);
      return acc;
    }, {});

    const chartData = Object.entries(grouped).map(([name, total]) => ({
      name,
      total: parseFloat(total.toFixed(2))
    }));

    res.json(chartData.length > 0 ? chartData : [{ name: 'Sin datos', total: 0 }]);
  } catch (error) {
    console.error('Error en getChart:', error);
    res.status(500).json({ error: 'Error al obtener datos del gráfico' });
  }
};

module.exports = { getStats, getChart };
