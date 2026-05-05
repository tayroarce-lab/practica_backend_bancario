const { DataTypes } = require('sequelize');
const { sequelize } = require('../database');

const RefreshToken = sequelize.define('RefreshToken', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  token: {
    type: DataTypes.STRING(500),
    allowNull: false,
    unique: true
  },
  usuarioId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  expiresAt: {
    type: DataTypes.DATE,
    allowNull: false
  },
  usado: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  ipOrigen: {
    type: DataTypes.STRING(45),
    allowNull: true
  }
}, {
  tableName: 'refresh_tokens',
  timestamps: true
});

module.exports = RefreshToken;
