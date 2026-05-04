'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Cuentas', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      numeroCuenta: {
        type: Sequelize.STRING(20),
        allowNull: false,
        unique: true
      },
      saldo: {
        type: Sequelize.DECIMAL(15, 2),
        defaultValue: 0.00
      },
      estado: {
        type: Sequelize.ENUM('activa', 'inactiva', 'bloqueada'),
        defaultValue: 'activa'
      },
      usuarioId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Usuarios',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT' // No permitir borrar si tiene cuentas
      },
      tipoCuentaId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'TipoCuentas',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Cuentas');
  }
};
