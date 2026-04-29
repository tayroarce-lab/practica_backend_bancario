// FILE: migrations/20260429000011-create-beneficiarios.js
'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('beneficiarios', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      usuario_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'usuarios', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      nombre_beneficiario: {
        type: Sequelize.STRING(150),
        allowNull: false,
      },
      num_cuenta_destino: {
        type: Sequelize.STRING(20),
        allowNull: false,
      },
      banco_destino: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      alias: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      estado: {
        type: Sequelize.TINYINT(1),
        allowNull: false,
        defaultValue: 1,
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
    await queryInterface.dropTable('beneficiarios');
  },
};
