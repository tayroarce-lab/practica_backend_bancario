// FILE: migrations/20260429000010-create-cuotas-prestamo.js
'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('cuotas_prestamo', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      prestamo_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'prestamos', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      numero_cuota: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      monto_cuota: {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: false,
      },
      monto_capital: {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: false,
      },
      monto_interes: {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: false,
      },
      fecha_vencimiento: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      fecha_pago: {
        type: Sequelize.DATEONLY,
        allowNull: true,
      },
      estado: {
        type: Sequelize.ENUM('pendiente', 'pagada', 'vencida'),
        allowNull: false,
        defaultValue: 'pendiente',
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    }, {
      charset: 'utf8mb4',
      collate: 'utf8mb4_unicode_ci',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('cuotas_prestamo');
  },
};
