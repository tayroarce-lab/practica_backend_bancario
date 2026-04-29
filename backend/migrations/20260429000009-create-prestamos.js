// FILE: migrations/20260429000009-create-prestamos.js
'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('prestamos', {
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
        onDelete: 'RESTRICT',
      },
      cuenta_desembolso_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'cuentas', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      monto_solicitado: {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: false,
      },
      monto_aprobado: {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: true,
      },
      tasa_interes: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: false,
      },
      plazo_meses: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      estado: {
        type: Sequelize.ENUM('solicitado', 'aprobado', 'rechazado', 'activo', 'pagado', 'moroso'),
        allowNull: false,
        defaultValue: 'solicitado',
      },
      fecha_solicitud: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      fecha_aprobacion: {
        type: Sequelize.DATEONLY,
        allowNull: true,
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
    await queryInterface.dropTable('prestamos');
  },
};
