// FILE: models/Transaccion.js
/**
 * Modelo Transaccion — Registro inmutable de movimientos financieros.
 * Tiene dos FK hacia cuentas con aliases CuentaOrigen y CuentaDestino.
 */
'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Transaccion extends Model {
    /**
     * Define las asociaciones del modelo.
     * @param {object} models - Modelos registrados en Sequelize.
     */
    static associate(models) {
      Transaccion.belongsTo(models.Cuenta, {
        as: 'CuentaOrigen',
        foreignKey: 'cuenta_origen_id',
      });

      Transaccion.belongsTo(models.Cuenta, {
        as: 'CuentaDestino',
        foreignKey: 'cuenta_destino_id',
      });

      Transaccion.belongsTo(models.TipoTransaccion, {
        foreignKey: 'tipo_transaccion_id',
      });
    }
  }

  Transaccion.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      cuenta_origen_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      cuenta_destino_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      tipo_transaccion_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      monto: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
      },
      descripcion: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      referencia: {
        type: DataTypes.STRING(100),
        allowNull: true,
        unique: true,
      },
      estado: {
        type: DataTypes.ENUM('pendiente', 'completada', 'fallida', 'revertida'),
        allowNull: false,
        defaultValue: 'pendiente',
      },
      fecha_transaccion: {
        type: DataTypes.DATE,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: 'Transaccion',
      tableName: 'transacciones',
      underscored: true,
      timestamps: true,
    }
  );

  return Transaccion;
};
