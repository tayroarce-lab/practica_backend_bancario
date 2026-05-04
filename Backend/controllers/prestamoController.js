const { Prestamo, Cuenta, Usuario, Transaccion, sequelize } = require('../models');

// Solicitar un préstamo
const solicitarPrestamo = async (req, res) => {
  try {
    const { monto, tasaInteres, plazoMeses, usuarioId } = req.body;

    // Validar usuario
    const usuario = await Usuario.findByPk(usuarioId);
    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Calcular cuota mensual (Fórmula de amortización simple)
    const principal = Number(monto);
    const tasaMensual = Number(tasaInteres) / 100 / 12;
    const n = Number(plazoMeses);
    
    // Si la tasa es 0, cuota es principal / n
    let cuotaMensual = 0;
    if (tasaMensual > 0) {
      cuotaMensual = (principal * tasaMensual * Math.pow(1 + tasaMensual, n)) / (Math.pow(1 + tasaMensual, n) - 1);
    } else {
      cuotaMensual = principal / n;
    }

    const prestamo = await Prestamo.create({
      monto,
      tasaInteres,
      plazoMeses,
      cuotaMensual: cuotaMensual.toFixed(2),
      usuarioId,
      estado: 'pendiente'
    });

    res.status(201).json(prestamo);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al solicitar el préstamo' });
  }
};

// Aprobar préstamo y desembolsar fondos
const aprobarPrestamo = async (req, res) => {
  const { id } = req.params;
  const { cuentaDesembolsoId } = req.body;

  if (!cuentaDesembolsoId) {
    return res.status(400).json({ error: 'Debe especificar la cuenta de desembolso' });
  }

  const t = await sequelize.transaction();

  try {
    const prestamo = await Prestamo.findByPk(id, { transaction: t });
    if (!prestamo) {
      await t.rollback();
      return res.status(404).json({ error: 'Préstamo no encontrado' });
    }

    if (prestamo.estado !== 'pendiente') {
      await t.rollback();
      return res.status(400).json({ error: `El préstamo no está pendiente. Estado actual: ${prestamo.estado}` });
    }

    const cuenta = await Cuenta.findByPk(cuentaDesembolsoId, { transaction: t, lock: t.LOCK.UPDATE });
    if (!cuenta) {
      await t.rollback();
      return res.status(404).json({ error: 'Cuenta de desembolso no encontrada' });
    }

    if (cuenta.estado !== 'activa') {
      await t.rollback();
      return res.status(400).json({ error: 'La cuenta de desembolso no está activa' });
    }

    // Actualizar estado del préstamo
    await prestamo.update({ 
      estado: 'aprobado',
      cuentaDesembolsoId 
    }, { transaction: t });

    // Desembolsar fondos a la cuenta
    const montoPrestamo = Number(prestamo.monto);
    const saldoAnterior = Number(cuenta.saldo);
    const saldoPosterior = saldoAnterior + montoPrestamo;

    await cuenta.update({ saldo: saldoPosterior }, { transaction: t });

    // Registrar la transacción de desembolso
    await Transaccion.create({
      tipo: 'deposito',
      monto: montoPrestamo,
      descripcion: `Desembolso de Préstamo #${prestamo.id}`,
      cuentaDestinoId: cuenta.id,
      saldoAnterior,
      saldoPosterior
    }, { transaction: t });

    await t.commit();
    res.json({ message: 'Préstamo aprobado y desembolsado', prestamo });
  } catch (error) {
    await t.rollback();
    console.error(error);
    res.status(500).json({ error: 'Error al aprobar el préstamo' });
  }
};

// Rechazar préstamo
const rechazarPrestamo = async (req, res) => {
  try {
    const { id } = req.params;
    
    const prestamo = await Prestamo.findByPk(id);
    if (!prestamo) {
      return res.status(404).json({ error: 'Préstamo no encontrado' });
    }

    if (prestamo.estado !== 'pendiente') {
      return res.status(400).json({ error: `Solo se pueden rechazar préstamos pendientes` });
    }

    await prestamo.update({ estado: 'rechazado' });
    
    res.json({ message: 'Préstamo rechazado', prestamo });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al rechazar el préstamo' });
  }
};

// Obtener todos los préstamos
const obtenerPrestamos = async (req, res) => {
  try {
    const prestamos = await Prestamo.findAll({
      include: [
        { model: Usuario, as: 'usuario', attributes: ['id', 'nombre', 'apellido', 'email'] },
        { model: Cuenta, as: 'cuentaDesembolso', attributes: ['numeroCuenta'] }
      ]
    });
    res.json(prestamos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener los préstamos' });
  }
};

// Obtener préstamos de un usuario
const obtenerPrestamosPorUsuario = async (req, res) => {
  try {
    const { usuarioId } = req.params;
    const prestamos = await Prestamo.findAll({
      where: { usuarioId },
      include: [
        { model: Cuenta, as: 'cuentaDesembolso', attributes: ['numeroCuenta'] }
      ]
    });
    res.json(prestamos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener los préstamos del usuario' });
  }
};

module.exports = {
  solicitarPrestamo,
  aprobarPrestamo,
  rechazarPrestamo,
  obtenerPrestamos,
  obtenerPrestamosPorUsuario
};
