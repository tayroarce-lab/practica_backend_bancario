// FILE: models/Tarjeta.js
/**
 * Modelo Tarjeta — Tarjetas débito/crédito vinculadas a cuentas.
 * Datos sensibles (número, CVV) siempre almacenados como hash.
 */
'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Tarjeta extends Model {
    /**
     * Define las asociaciones del modelo.
     * @param {object} models - Modelos registrados en Sequelize.
     */
    static associate(models) {
      Tarjeta.belongsTo(models.Cuenta, {
        foreignKey: 'cuenta_id',
      });
    }
  }

  Tarjeta.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      cuenta_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      numero_tarjeta_hash: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      ultimos_digitos: {
        type: DataTypes.CHAR(4),
        allowNull: false,
      },
      tipo: {
        type: DataTypes.ENUM('debito', 'credito'),
        allowNull: false,
      },
      fecha_vencimiento: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      cvv_hash: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      limite_credito: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: true,
      },
      estado: {
        type: DataTypes.ENUM('activa', 'bloqueada', 'vencida', 'cancelada'),
        allowNull: false,
        defaultValue: 'activa',
      },
    },
    {
      sequelize,
      modelName: 'Tarjeta',
      tableName: 'tarjetas',
      underscored: true,
      timestamps: true,
    }
  );

  return Tarjeta;
};
