// FILE: models/Cuenta.js
/**
 * Modelo Cuenta — Cuentas bancarias activas en el sistema.
 */
'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Cuenta extends Model {
    /**
     * Define las asociaciones del modelo.
     * @param {object} models - Modelos registrados en Sequelize.
     */
    static associate(models) {
      Cuenta.belongsTo(models.Usuario, {
        foreignKey: 'usuario_id',
      });

      Cuenta.belongsTo(models.TipoCuenta, {
        foreignKey: 'tipo_cuenta_id',
      });

      Cuenta.belongsTo(models.Sucursal, {
        foreignKey: 'sucursal_id',
      });

      Cuenta.hasMany(models.Transaccion, {
        as: 'TransaccionesOrigen',
        foreignKey: 'cuenta_origen_id',
      });

      Cuenta.hasMany(models.Transaccion, {
        as: 'TransaccionesDestino',
        foreignKey: 'cuenta_destino_id',
      });

      Cuenta.hasMany(models.Tarjeta, {
        foreignKey: 'cuenta_id',
      });

      Cuenta.hasMany(models.Prestamo, {
        as: 'PrestamosDesembolso',
        foreignKey: 'cuenta_desembolso_id',
      });
    }
  }

  Cuenta.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      usuario_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      tipo_cuenta_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      sucursal_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      numero_cuenta: {
        type: DataTypes.STRING(20),
        allowNull: false,
        unique: true,
      },
      saldo: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
        defaultValue: 0.00,
      },
      moneda: {
        type: DataTypes.STRING(3),
        allowNull: false,
        defaultValue: 'USD',
      },
      estado: {
        type: DataTypes.ENUM('activa', 'inactiva', 'bloqueada', 'cerrada'),
        allowNull: false,
        defaultValue: 'activa',
      },
      fecha_apertura: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: 'Cuenta',
      tableName: 'cuentas',
      underscored: true,
      timestamps: true,
    }
  );

  return Cuenta;
};
