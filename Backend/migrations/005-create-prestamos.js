'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Prestamos', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      monto: {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: false
      },
      tasaInteres: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: false
      },
      plazoMeses: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      cuotaMensual: {
        type: Sequelize.DECIMAL(15, 2)
      },
      estado: {
        type: Sequelize.ENUM('pendiente', 'aprobado', 'rechazado', 'pagado'),
        defaultValue: 'pendiente'
      },
      usuarioId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Usuarios',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      cuentaDesembolsoId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'Cuentas',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
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
    await queryInterface.dropTable('Prestamos');
  }
};
