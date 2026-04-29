// FILE: models/Beneficiario.js
/**
 * Modelo Beneficiario — Cuentas de terceros guardadas para transferencias rápidas.
 */
'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Beneficiario extends Model {
    static associate(models) {
      Beneficiario.belongsTo(models.Usuario, { foreignKey: 'usuario_id' });
    }
  }

  Beneficiario.init(
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false },
      usuario_id: { type: DataTypes.INTEGER, allowNull: false },
      nombre_beneficiario: { type: DataTypes.STRING(150), allowNull: false },
      num_cuenta_destino: { type: DataTypes.STRING(20), allowNull: false },
      banco_destino: { type: DataTypes.STRING(100), allowNull: false },
      alias: { type: DataTypes.STRING(50), allowNull: true },
      estado: { type: DataTypes.TINYINT(1), allowNull: false, defaultValue: 1 },
    },
    { sequelize, modelName: 'Beneficiario', tableName: 'beneficiarios', underscored: true, timestamps: true }
  );

  return Beneficiario;
};
