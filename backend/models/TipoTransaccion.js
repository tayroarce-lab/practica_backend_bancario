// FILE: models/TipoTransaccion.js
/**
 * Modelo TipoTransaccion — Catálogo de tipos de operación financiera.
 * Valores esperados: Deposito, Retiro, Transferencia, Pago Servicio.
 */
'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class TipoTransaccion extends Model {
    /**
     * Define las asociaciones del modelo.
     * @param {object} models - Modelos registrados en Sequelize.
     */
    static associate(models) {
      TipoTransaccion.hasMany(models.Transaccion, {
        foreignKey: 'tipo_transaccion_id',
      });
    }
  }

  TipoTransaccion.init(
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
    },
    {
      sequelize,
      modelName: 'TipoTransaccion',
      tableName: 'tipos_transaccion',
      underscored: true,
      timestamps: true,
    }
  );

  return TipoTransaccion;
};
