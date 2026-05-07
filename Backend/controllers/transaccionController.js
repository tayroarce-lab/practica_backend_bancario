const { Cuenta, Transaccion, Usuario, sequelize } = require('../models');
const socketUtils = require('../utils/socket');

// Realizar transferencia entre cuentas (Con Transacción de base de datos)
const realizarTransferencia = async (req, res) => {
  const { cuentaOrigenId, numeroCuentaDestino, monto, descripcion } = req.body;
  const montoDecimal = Number(monto);

  if (!numeroCuentaDestino) {
    return res.status(400).json({ error: 'Se requiere el número de cuenta de destino' });
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

    // 2. Validar cuenta destino usando numeroCuentaDestino
    const cuentaDestino = await Cuenta.findOne({ 
      where: { numeroCuenta: numeroCuentaDestino },
      transaction: t, 
      lock: t.LOCK.UPDATE 
    });

    if (!cuentaDestino) {
      await t.rollback();
      return res.status(404).json({ error: 'Cuenta de destino no encontrada o número incorrecto' });
    }
    if (cuentaDestino.estado !== 'activa') {
      await t.rollback();
      return res.status(400).json({ error: 'La cuenta de destino no está activa' });
    }

    // Validación básica: origen y destino no pueden ser la misma cuenta
    if (cuentaOrigen.id === cuentaDestino.id) {
      await t.rollback();
      return res.status(400).json({ error: 'No se puede transferir a la misma cuenta' });
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
    const { Op } = require('sequelize');
    
    // Construir filtros iniciales
    let whereClause = {};
    if (tipo) whereClause.tipo = tipo;
    
    // RESTRICCIÓN: Cliente solo ve movimientos de sus propias cuentas
    if (req.usuario.rol === 'cliente') {
      const susCuentas = await Cuenta.findAll({
        where: { usuarioId: req.usuario.id },
        attributes: ['id']
      });
      const idsCuentas = susCuentas.map(c => c.id);

      if (cuentaId) {
        // Si pide una cuenta específica, validar que sea suya
        if (!idsCuentas.includes(parseInt(cuentaId))) {
          return res.status(403).json({ error: 'No tienes permisos para ver el historial de esta cuenta' });
        }
        whereClause[Op.or] = [
          { cuentaOrigenId: cuentaId },
          { cuentaDestinoId: cuentaId }
        ];
      } else {
        // Si no pide cuenta específica, ver todos sus movimientos (en cualquier cuenta suya)
        whereClause[Op.or] = [
          { cuentaOrigenId: { [Op.in]: idsCuentas } },
          { cuentaDestinoId: { [Op.in]: idsCuentas } }
        ];
      }
    } else if (cuentaId) {
      // Admin/Empleado filtrando por una cuenta específica
      whereClause[Op.or] = [
        { cuentaOrigenId: cuentaId },
        { cuentaDestinoId: cuentaId }
      ];
    }

    const transacciones = await Transaccion.findAll({
      where: whereClause,
      include: [
        { model: Cuenta, as: 'cuentaOrigen', attributes: ['numeroCuenta'], include: [{ model: Usuario, as: 'usuario', attributes: ['nombre', 'apellido'] }] },
        { model: Cuenta, as: 'cuentaDestino', attributes: ['numeroCuenta'], include: [{ model: Usuario, as: 'usuario', attributes: ['nombre', 'apellido'] }] }
      ],
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

// Validar cuenta destino para mostrar el nombre del titular antes de transferir
const validarCuentaDestino = async (req, res) => {
  const { numeroCuenta } = req.body;
  if (!numeroCuenta) return res.status(400).json({ error: 'El número de cuenta es requerido' });

  try {
    const cuenta = await Cuenta.findOne({
      where: { numeroCuenta },
      include: [{ model: Usuario, as: 'usuario', attributes: ['nombre', 'apellido'] }]
    });

    if (!cuenta) {
      return res.status(404).json({ error: 'La cuenta no existe o el número es incorrecto' });
    }

    if (cuenta.estado !== 'activa') {
      return res.status(400).json({ error: 'La cuenta destino no se encuentra activa' });
    }

    res.json({ 
      valido: true, 
      titular: `${cuenta.usuario.nombre} ${cuenta.usuario.apellido}`
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al validar la cuenta destino' });
  }
};

module.exports = {
  realizarTransferencia,
  obtenerTransacciones,
  obtenerTransaccionesPorCuenta,
  validarCuentaDestino
};
