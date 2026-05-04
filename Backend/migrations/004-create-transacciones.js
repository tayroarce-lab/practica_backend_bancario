'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Transacciones', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      tipo: {
        type: Sequelize.ENUM('deposito', 'retiro', 'transferencia'),
        allowNull: false
      },
      monto: {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: false
      },
      descripcion: {
        type: Sequelize.TEXT
      },
      cuentaOrigenId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'Cuentas',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      cuentaDestinoId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'Cuentas',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      saldoAnterior: {
        type: Sequelize.DECIMAL(15, 2)
      },
      saldoPosterior: {
        type: Sequelize.DECIMAL(15, 2)
      },
      fecha: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
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
    await queryInterface.dropTable('Transacciones');
  }
};
