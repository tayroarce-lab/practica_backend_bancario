const { sequelize } = require('../database');

// Importar todos los modelos
const Usuario = require('./Usuario');
const TipoCuenta = require('./TipoCuenta');
const Cuenta = require('./Cuenta');
const Transaccion = require('./Transaccion');
const Prestamo = require('./Prestamo');

// Relaciones: Usuario hasMany Cuenta, Cuenta belongsTo Usuario
Usuario.hasMany(Cuenta, { foreignKey: 'usuarioId', as: 'cuentas' });
Cuenta.belongsTo(Usuario, { foreignKey: 'usuarioId', as: 'usuario' });

// Relaciones: TipoCuenta hasMany Cuenta, Cuenta belongsTo TipoCuenta
TipoCuenta.hasMany(Cuenta, { foreignKey: 'tipoCuentaId', as: 'cuentas' });
Cuenta.belongsTo(TipoCuenta, { foreignKey: 'tipoCuentaId', as: 'tipoCuenta' });

// Relaciones de Transacciones
// Cuenta hasMany Transaccion (como origen)
Cuenta.hasMany(Transaccion, { foreignKey: 'cuentaOrigenId', as: 'transaccionesOrigen' });
Transaccion.belongsTo(Cuenta, { foreignKey: 'cuentaOrigenId', as: 'cuentaOrigen' });

// Cuenta hasMany Transaccion (como destino)
Cuenta.hasMany(Transaccion, { foreignKey: 'cuentaDestinoId', as: 'transaccionesDestino' });
Transaccion.belongsTo(Cuenta, { foreignKey: 'cuentaDestinoId', as: 'cuentaDestino' });

// Relaciones de Prestamos
Usuario.hasMany(Prestamo, { foreignKey: 'usuarioId', as: 'prestamos' });
Prestamo.belongsTo(Usuario, { foreignKey: 'usuarioId', as: 'usuario' });

// Relación entre Préstamo y Cuenta de desembolso
Cuenta.hasMany(Prestamo, { foreignKey: 'cuentaDesembolsoId', as: 'prestamosDesembolsados' });
Prestamo.belongsTo(Cuenta, { foreignKey: 'cuentaDesembolsoId', as: 'cuentaDesembolso' });

const db = {
  sequelize,
  Usuario,
  TipoCuenta,
  Cuenta,
  Transaccion,
  Prestamo
};

module.exports = db;
