const { DataTypes } = require('sequelize');
const { sequelize } = require('../database');

const Transaccion = sequelize.define('Transaccion', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  tipo: {
    type: DataTypes.ENUM('deposito', 'retiro', 'transferencia'),
    allowNull: false
  },
  monto: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
    validate: {
      min: 0.01 // El monto siempre debe ser mayor a 0
    }
  },
  descripcion: {
    type: DataTypes.TEXT
  },
  cuentaOrigenId: {
    type: DataTypes.INTEGER,
    allowNull: true // Puede ser null en depósitos externos
  },
  cuentaDestinoId: {
    type: DataTypes.INTEGER,
    allowNull: true // Puede ser null en retiros externos
  },
  saldoAnterior: {
    type: DataTypes.DECIMAL(15, 2)
  },
  saldoPosterior: {
    type: DataTypes.DECIMAL(15, 2)
  },
  fecha: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'Transacciones',
  timestamps: true
});

module.exports = Transaccion;
