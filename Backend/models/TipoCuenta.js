const { DataTypes } = require('sequelize');
const { sequelize } = require('../database');

const TipoCuenta = sequelize.define('TipoCuenta', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nombre: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  descripcion: {
    type: DataTypes.TEXT
  }
}, {
  tableName: 'TipoCuentas',
  timestamps: true
});

module.exports = TipoCuenta;
