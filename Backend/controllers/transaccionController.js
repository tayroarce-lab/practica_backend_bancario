const { Cuenta, Transaccion, sequelize } = require('../models');
const socketUtils = require('../utils/socket');

// Realizar transferencia entre cuentas (Con Transacción de base de datos)
const realizarTransferencia = async (req, res) => {
  const { cuentaOrigenId, cuentaDestinoId, monto, descripcion } = req.body;
  const montoDecimal = Number(monto);

  // Validación básica
  if (cuentaOrigenId === cuentaDestinoId) {
    return res.status(400).json({ error: 'No se puede transferir a la misma cuenta' });
  }

  // Iniciar Transacción de Sequelize
  const t = await sequelize.transaction();

  try {
    // 1. Validar cuenta origen
    const cuentaOrigen = await Cuenta.findByPk(cuentaOrigenId, { transaction: t, lock: t.LOCK.UPDATE });
    if (!cuentaOrigen) {
      await t.rollback();
      return res.status(404).json({ error: 'Cuenta de origen no encontrada' });
    }
    if (cuentaOrigen.estado !== 'activa') {
      await t.rollback();
      return res.status(400).json({ error: 'La cuenta de origen no está activa' });
    }

    // RESTRICCIÓN: Cliente solo puede transferir desde sus propias cuentas
    if (req.usuario.rol === 'cliente' && cuentaOrigen.usuarioId !== req.usuario.id) {
      await t.rollback();
      return res.status(403).json({ error: 'No tienes permisos para transferir desde esta cuenta' });
    }

    // 2. Validar cuenta destino
    const cuentaDestino = await Cuenta.findByPk(cuentaDestinoId, { transaction: t, lock: t.LOCK.UPDATE });
    if (!cuentaDestino) {
      await t.rollback();
      return res.status(404).json({ error: 'Cuenta de destino no encontrada' });
    }
    if (cuentaDestino.estado !== 'activa') {
      await t.rollback();
      return res.status(400).json({ error: 'La cuenta de destino no está activa' });
    }

    // 3. Validar saldo
    const saldoAnteriorOrigen = Number(cuentaOrigen.saldo);
    if (saldoAnteriorOrigen < montoDecimal) {
      await t.rollback();
      return res.status(400).json({ error: 'Saldo insuficiente en cuenta de origen' });
    }

    const saldoAnteriorDestino = Number(cuentaDestino.saldo);

    // 4. Calcular nuevos saldos
    const saldoPosteriorOrigen = saldoAnteriorOrigen - montoDecimal;
    const saldoPosteriorDestino = saldoAnteriorDestino + montoDecimal;

    // 5. Actualizar saldos
    await cuentaOrigen.update({ saldo: saldoPosteriorOrigen }, { transaction: t });
    await cuentaDestino.update({ saldo: saldoPosteriorDestino }, { transaction: t });

    // 6. Registrar la transacción en el historial
    const transaccion = await Transaccion.create({
      tipo: 'transferencia',
      monto: montoDecimal,
      descripcion: descripcion || 'Transferencia entre cuentas',
      cuentaOrigenId: cuentaOrigen.id,
      cuentaDestinoId: cuentaDestino.id,
      saldoAnterior: saldoAnteriorOrigen, // Perspectiva de origen
      saldoPosterior: saldoPosteriorOrigen
    }, { transaction: t });

    // 7. Commit si todo salió bien
    await t.commit();

    // NOTIFICACIONES REAL-TIME
    // Notificar al emisor
    socketUtils.emitToUser(cuentaOrigen.usuarioId, 'balance_update', {
      cuentaId: cuentaOrigen.id,
      nuevoSaldo: saldoPosteriorOrigen
    });

    // Notificar al receptor
    socketUtils.emitToUser(cuentaDestino.usuarioId, 'balance_update', {
      cuentaId: cuentaDestino.id,
      nuevoSaldo: saldoPosteriorDestino
    });
    
    socketUtils.emitToUser(cuentaDestino.usuarioId, 'new_transaction', {
      tipo: 'transferencia',
      monto: montoDecimal,
      descripcion: descripcion || 'Transferencia recibida'
    });

    res.json({ message: 'Transferencia realizada con éxito', transaccion });
  } catch (error) {
    // Rollback en caso de error
    await t.rollback();
    console.error(error);
    res.status(500).json({ error: 'Error interno al procesar la transferencia' });
  }
};

// Obtener todas las transacciones (con filtros opcionales)
const obtenerTransacciones = async (req, res) => {
  try {
    const { tipo, cuentaId } = req.query;
    
    // Construir filtros
    let whereClause = {};
    if (tipo) whereClause.tipo = tipo;
    
    if (cuentaId) {
      whereClause = {
        ...whereClause,
        [require('sequelize').Op.or]: [
          { cuentaOrigenId: cuentaId },
          { cuentaDestinoId: cuentaId }
        ]
      };
    }

    const transacciones = await Transaccion.findAll({
      where: whereClause,
      order: [['fecha', 'DESC']]
    });

    res.json(transacciones);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener transacciones' });
  }
};

// Obtener historial de una cuenta
const obtenerTransaccionesPorCuenta = async (req, res) => {
  try {
    const { cuentaId } = req.params;

    // Verificar propiedad de la cuenta si es cliente
    if (req.usuario.rol === 'cliente') {
      const cuenta = await Cuenta.findByPk(cuentaId);
      if (!cuenta || cuenta.usuarioId !== req.usuario.id) {
        return res.status(403).json({ error: 'No tienes permisos para ver el historial de esta cuenta' });
      }
    }

    const transacciones = await Transaccion.findAll({
      where: {
        [require('sequelize').Op.or]: [
          { cuentaOrigenId: cuentaId },
          { cuentaDestinoId: cuentaId }
        ]
      },
      order: [['fecha', 'DESC']]
    });

    res.json(transacciones);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener transacciones de la cuenta' });
  }
};

module.exports = {
  realizarTransferencia,
  obtenerTransacciones,
  obtenerTransaccionesPorCuenta
};
