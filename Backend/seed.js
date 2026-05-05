const { Usuario, Cuenta, Transaccion, sequelize } = require('./models');

const seedData = async () => {
  try {
    // Sincronizar (en caso de que falte algo, aunque ya corrimos migraciones)
    await sequelize.authenticate();
    console.log('Conexión establecida. Iniciando inyección de datos...');

    // 1. Crear Usuarios con Roles
    const user1 = await Usuario.create({
      nombre: 'Juan',
      apellido: 'Perez',
      email: 'juan.perez@email.com',
      password: 'password123', // El hook lo encriptará
      telefono: '555-1234',
      dui: '01234567-8',
      fechaNacimiento: '1990-05-15',
      activo: true,
      rol: 'admin'
    });

    const user2 = await Usuario.create({
      nombre: 'Maria',
      apellido: 'Gomez',
      email: 'maria.gomez@email.com',
      password: 'password123',
      telefono: '555-9876',
      dui: '09876543-2',
      fechaNacimiento: '1985-10-20',
      activo: true,
      rol: 'cliente'
    });

    const user3 = await Usuario.create({
      nombre: 'Carlos',
      apellido: 'Empleado',
      email: 'carlos.empleado@email.com',
      password: 'password123',
      telefono: '555-4321',
      dui: '05555555-5',
      fechaNacimiento: '1992-03-10',
      activo: true,
      rol: 'empleado'
    });

    console.log('Usuarios creados con éxito (Admin, Cliente, Empleado).');

    // 2. Crear Cuentas
    // Recordatorio: tipoCuentaId 1 = Ahorro, 2 = Corriente (fueron creados en la migración 001)
    const cuenta1 = await Cuenta.create({
      numeroCuenta: 'CTA-' + Date.now() + '11',
      saldo: 500.00,
      estado: 'activa',
      usuarioId: user1.id,
      tipoCuentaId: 1 // Ahorro
    });

    const cuenta2 = await Cuenta.create({
      numeroCuenta: 'CTA-' + Date.now() + '22',
      saldo: 1500.00,
      estado: 'activa',
      usuarioId: user2.id,
      tipoCuentaId: 2 // Corriente
    });

    console.log('Cuentas creadas con éxito.');

    // 3. Crear Transacciones iniciales para cuadrar el saldo
    await Transaccion.create({
      tipo: 'deposito',
      monto: 500.00,
      descripcion: 'Depósito inicial de apertura',
      cuentaDestinoId: cuenta1.id,
      saldoAnterior: 0.00,
      saldoPosterior: 500.00
    });

    await Transaccion.create({
      tipo: 'deposito',
      monto: 1500.00,
      descripcion: 'Depósito inicial de apertura',
      cuentaDestinoId: cuenta2.id,
      saldoAnterior: 0.00,
      saldoPosterior: 1500.00
    });

    console.log('Transacciones iniciales creadas con éxito.');
    console.log('¡Inyección de datos finalizada!');
    process.exit(0);
  } catch (error) {
    console.error('Error inyectando datos:', error);
    process.exit(1);
  }
};

seedData();
