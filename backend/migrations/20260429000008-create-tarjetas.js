// FILE: migrations/20260429000008-create-tarjetas.js
'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('tarjetas', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      cuenta_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'cuentas', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      numero_tarjeta_hash: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      ultimos_digitos: {
        type: Sequelize.CHAR(4),
        allowNull: false,
      },
      tipo: {
        type: Sequelize.ENUM('debito', 'credito'),
        allowNull: false,
      },
      fecha_vencimiento: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      cvv_hash: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      limite_credito: {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: true,
      },
      estado: {
        type: Sequelize.ENUM('activa', 'bloqueada', 'vencida', 'cancelada'),
        allowNull: false,
        defaultValue: 'activa',
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
    await queryInterface.dropTable('tarjetas');
  },
};
