const { DataTypes } = require('sequelize');
const { sequelize } = require('../database');

const Cuenta = sequelize.define('Cuenta', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  numeroCuenta: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true
  },
  saldo: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0.00
  },
  estado: {
    type: DataTypes.ENUM('activa', 'inactiva', 'bloqueada'),
    defaultValue: 'activa'
  },
  usuarioId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  tipoCuentaId: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
}, {
  tableName: 'Cuentas',
  timestamps: true
});

module.exports = Cuenta;
