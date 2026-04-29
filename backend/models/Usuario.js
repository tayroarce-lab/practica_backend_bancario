// FILE: models/Usuario.js
/**
 * Modelo Usuario — Clientes y empleados del sistema bancario.
 */
'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Usuario extends Model {
    /**
     * Define las asociaciones del modelo.
     * @param {object} models - Modelos registrados en Sequelize.
     */
    static associate(models) {
      Usuario.belongsTo(models.Role, {
        foreignKey: 'rol_id',
      });

      Usuario.hasMany(models.Cuenta, {
        foreignKey: 'usuario_id',
      });

      Usuario.hasMany(models.Prestamo, {
        foreignKey: 'usuario_id',
      });

      Usuario.hasMany(models.Beneficiario, {
        foreignKey: 'usuario_id',
      });
    }
  }

  Usuario.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      rol_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      nombre: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      apellido: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING(150),
        allowNull: false,
        unique: true,
      },
      password_hash: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      telefono: {
        type: DataTypes.STRING(20),
        allowNull: true,
      },
      num_identificacion: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
      },
      fecha_nacimiento: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      direccion: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      estado: {
        type: DataTypes.ENUM('activo', 'inactivo', 'suspendido'),
        allowNull: false,
        defaultValue: 'activo',
      },
    },
    {
      sequelize,
      modelName: 'Usuario',
      tableName: 'usuarios',
      underscored: true,
      timestamps: true,
    }
  );

  return Usuario;
};
