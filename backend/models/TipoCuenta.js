// FILE: models/TipoCuenta.js
/**
 * Modelo TipoCuenta — Categorías de cuentas bancarias.
 * Valores esperados: Ahorros, Corriente, CDT, etc.
 */
'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class TipoCuenta extends Model {
    /**
     * Define las asociaciones del modelo.
     * @param {object} models - Modelos registrados en Sequelize.
     */
    static associate(models) {
      TipoCuenta.hasMany(models.Cuenta, {
        foreignKey: 'tipo_cuenta_id',
      });
    }
  }

  TipoCuenta.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      nombre: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
      },
      descripcion: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      tasa_interes: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: false,
        defaultValue: 0.00,
      },
    },
    {
      sequelize,
      modelName: 'TipoCuenta',
      tableName: 'tipos_cuenta',
      underscored: true,
      timestamps: true,
    }
  );

  return TipoCuenta;
};
