const { Cuenta, Usuario, TipoCuenta, Transaccion, sequelize } = require('../models');
const socketUtils = require('../utils/socket');

// Función auxiliar para generar un número de cuenta único
const generarNumeroCuenta = () => {
  return 'CTA-' + Date.now() + Math.floor(Math.random() * 1000);
};

// Crear nueva cuenta
const crearCuenta = async (req, res) => {
  try {
    const { usuarioId, tipoCuentaId } = req.body;

    // Validar que el usuario exista
    const usuario = await Usuario.findByPk(usuarioId);
    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Validar que el tipo de cuenta exista
    const tipoCuenta = await TipoCuenta.findByPk(tipoCuentaId);
    if (!tipoCuenta) {
      return res.status(404).json({ error: 'Tipo de cuenta no encontrado' });
    }

    // Crear la cuenta con un número único
    const nuevaCuenta = await Cuenta.create({
      numeroCuenta: generarNumeroCuenta(),
      saldo: 0.00,
      estado: 'activa',
      usuarioId,
      tipoCuentaId
    });

    res.status(201).json(nuevaCuenta);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al crear la cuenta' });
  }
};

// Obtener todas las cuentas
const obtenerCuentas = async (req, res) => {
  try {
    const cuentas = await Cuenta.findAll({
      include: [
        { model: Usuario, as: 'usuario', attributes: ['id', 'nombre', 'apellido', 'email'] },
        { model: TipoCuenta, as: 'tipoCuenta', attributes: ['id', 'nombre'] }
      ]
    });
    res.json(cuentas);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener las cuentas' });
  }
};

// Obtener cuenta por ID incluyendo últimas 10 transacciones
const obtenerCuentaPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const cuenta = await Cuenta.findByPk(id, {
      include: [
        { model: Usuario, as: 'usuario', attributes: ['id', 'nombre', 'apellido'] },
        { model: TipoCuenta, as: 'tipoCuenta', attributes: ['id', 'nombre'] }
      ]
    });

    if (!cuenta) {
      return res.status(404).json({ error: 'Cuenta no encontrada' });
    }

    // RESTRICCIÓN: Cliente solo puede ver sus propias cuentas
    if (req.usuario.rol === 'cliente' && cuenta.usuarioId !== req.usuario.id) {
      return res.status(403).json({ error: 'No tienes permisos para ver esta cuenta' });
    }

    // Buscar las últimas 10 transacciones asociadas a la cuenta
    const transacciones = await Transaccion.findAll({
      where: {
        [require('sequelize').Op.or]: [
          { cuentaOrigenId: id },
          { cuentaDestinoId: id }
        ]
      },
      order: [['fecha', 'DESC']],
      limit: 10
    });

    const cuentaJSON = cuenta.toJSON();
    cuentaJSON.ultimasTransacciones = transacciones;

    res.json(cuentaJSON);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener la cuenta' });
  }
};

// Obtener cuentas de un usuario específico
const obtenerCuentasPorUsuario = async (req, res) => {
  try {
    const { usuarioId } = req.params;

    // RESTRICCIÓN: Cliente solo puede ver su propio usuarioId
    if (req.usuario.rol === 'cliente' && parseInt(usuarioId) !== req.usuario.id) {
      return res.status(403).json({ error: 'No tienes permisos para listar las cuentas de otro usuario' });
    }

    const cuentas = await Cuenta.findAll({
      where: { usuarioId },
      include: [
        { model: TipoCuenta, as: 'tipoCuenta', attributes: ['nombre'] }
      ]
    });
    res.json(cuentas);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener las cuentas del usuario' });
  }
};

// Actualizar estado de la cuenta
const actualizarEstadoCuenta = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;

    const estadosPermitidos = ['activa', 'inactiva', 'bloqueada'];
    if (!estadosPermitidos.includes(estado)) {
      return res.status(400).json({ error: 'Estado inválido' });
    }

    const cuenta = await Cuenta.findByPk(id);
    if (!cuenta) {
      return res.status(404).json({ error: 'Cuenta no encontrada' });
    }

    await cuenta.update({ estado });
    res.json({ message: 'Estado de cuenta actualizado', cuenta });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al actualizar el estado de la cuenta' });
  }
};

// Depositar fondos
const depositarFondos = async (req, res) => {
  const { id } = req.params;
  const { monto, descripcion } = req.body;
  const montoDecimal = Number(monto);

  const t = await sequelize.transaction();

  try {
    // Bloquear la fila de la cuenta para lectura/escritura simultánea (Evita Race Conditions)
    const cuenta = await Cuenta.findByPk(id, { transaction: t, lock: t.LOCK.UPDATE });
    
    if (!cuenta) {
      await t.rollback();
      return res.status(404).json({ error: 'Cuenta no encontrada' });
    }
    
    if (cuenta.estado !== 'activa') {
      await t.rollback();
      return res.status(400).json({ error: 'La cuenta no está activa' });
    }

    const saldoAnterior = Number(cuenta.saldo);
    const saldoPosterior = saldoAnterior + montoDecimal;

    // Actualizar saldo
    await cuenta.update({ saldo: saldoPosterior }, { transaction: t });

    // Crear transacción
    const transaccion = await Transaccion.create({
      tipo: 'deposito',
      monto: montoDecimal,
      descripcion: descripcion || 'Depósito en efectivo',
      cuentaDestinoId: id,
      saldoAnterior,
      saldoPosterior
    }, { transaction: t });

    await t.commit();

    // NOTIFICACIONES REAL-TIME
    socketUtils.emitToUser(cuenta.usuarioId, 'balance_update', {
      cuentaId: cuenta.id,
      nuevoSaldo: saldoPosterior
    });

    socketUtils.emitToUser(cuenta.usuarioId, 'new_transaction', {
      tipo: 'deposito',
      monto: montoDecimal,
      descripcion: descripcion || 'Depósito recibido'
    });

    res.json({ message: 'Depósito realizado con éxito', transaccion, cuenta });
  } catch (error) {
    await t.rollback();
    console.error(error);
    res.status(500).json({ error: 'Error al realizar el depósito' });
  }
};

// Retirar fondos
const retirarFondos = async (req, res) => {
  const { id } = req.params;
  const { monto, descripcion } = req.body;
  const montoDecimal = Number(monto);

  const t = await sequelize.transaction();

  try {
    // Bloquear la fila de la cuenta
    const cuenta = await Cuenta.findByPk(id, { transaction: t, lock: t.LOCK.UPDATE });
    
    if (!cuenta) {
      await t.rollback();
      return res.status(404).json({ error: 'Cuenta no encontrada' });
    }

    if (cuenta.estado !== 'activa') {
      await t.rollback();
      return res.status(400).json({ error: 'La cuenta no está activa' });
    }

    const saldoAnterior = Number(cuenta.saldo);
    if (saldoAnterior < montoDecimal) {
      await t.rollback();
      return res.status(400).json({ error: 'Saldo insuficiente' });
    }

    const saldoPosterior = saldoAnterior - montoDecimal;

    // Actualizar saldo
    await cuenta.update({ saldo: saldoPosterior }, { transaction: t });

    // Registrar transacción
    const transaccion = await Transaccion.create({
      tipo: 'retiro',
      monto: montoDecimal,
      descripcion: descripcion || 'Retiro de fondos',
      cuentaOrigenId: id,
      saldoAnterior,
      saldoPosterior
    }, { transaction: t });

    await t.commit();

    // NOTIFICACIONES REAL-TIME
    socketUtils.emitToUser(cuenta.usuarioId, 'balance_update', {
      cuentaId: cuenta.id,
      nuevoSaldo: saldoPosterior
    });

    socketUtils.emitToUser(cuenta.usuarioId, 'new_transaction', {
      tipo: 'retiro',
      monto: montoDecimal,
      descripcion: descripcion || 'Retiro realizado'
    });

    res.json({ message: 'Retiro realizado con éxito', transaccion, cuenta });
  } catch (error) {
    await t.rollback();
    console.error(error);
    res.status(500).json({ error: 'Error al realizar el retiro' });
  }
};

module.exports = {
  crearCuenta,
  obtenerCuentas,
  obtenerCuentaPorId,
  obtenerCuentasPorUsuario,
  actualizarEstadoCuenta,
  depositarFondos,
  retirarFondos
};
