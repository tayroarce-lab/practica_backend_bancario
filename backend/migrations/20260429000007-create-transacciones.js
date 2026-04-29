// FILE: migrations/20260429000007-create-transacciones.js
'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('transacciones', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      cuenta_origen_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'cuentas', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      cuenta_destino_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: 'cuentas', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      tipo_transaccion_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'tipos_transaccion', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      monto: {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: false,
      },
      descripcion: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      referencia: {
        type: Sequelize.STRING(100),
        allowNull: true,
        unique: true,
      },
      estado: {
        type: Sequelize.ENUM('pendiente', 'completada', 'fallida', 'revertida'),
        allowNull: false,
        defaultValue: 'pendiente',
      },
      fecha_transaccion: {
        type: Sequelize.DATE,
        allowNull: false,
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
    await queryInterface.dropTable('transacciones');
  },
};
