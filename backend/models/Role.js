// FILE: models/Role.js
/**
 * Modelo Role — Catálogo de roles del sistema.
 * Valores esperados: admin, cliente, empleado, cajero.
 */
'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Role extends Model {
    /**
     * Define las asociaciones del modelo.
     * @param {object} models - Modelos registrados en Sequelize.
     */
    static associate(models) {
      Role.hasMany(models.Usuario, {
        foreignKey: 'rol_id',
      });
    }
  }

  Role.init(
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
      modelName: 'Role',
      tableName: 'roles',
      underscored: true,
      timestamps: true,
    }
  );

  return Role;
};
