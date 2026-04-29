// FILE: models/Sucursal.js
/**
 * Modelo Sucursal — Agencias físicas del banco.
 */
'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Sucursal extends Model {
    /**
     * Define las asociaciones del modelo.
     * @param {object} models - Modelos registrados en Sequelize.
     */
    static associate(models) {
      Sucursal.hasMany(models.Cuenta, {
        foreignKey: 'sucursal_id',
      });
    }
  }

  Sucursal.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      nombre: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      direccion: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      telefono: {
        type: DataTypes.STRING(20),
        allowNull: true,
      },
      estado: {
        type: DataTypes.TINYINT(1),
        allowNull: false,
        defaultValue: 1,
      },
    },
    {
      sequelize,
      modelName: 'Sucursal',
      tableName: 'sucursales',
      underscored: true,
      timestamps: true,
    }
  );

  return Sucursal;
};
