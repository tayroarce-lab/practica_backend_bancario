'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('TipoCuentas', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      nombre: {
        type: Sequelize.STRING(50),
        allowNull: false
      },
      descripcion: {
        type: Sequelize.TEXT
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

    // Opcional: Insertar tipos de cuenta básicos
    await queryInterface.bulkInsert('TipoCuentas', [
      { nombre: 'Ahorro', descripcion: 'Cuenta de ahorros estándar', createdAt: new Date(), updatedAt: new Date() },
      { nombre: 'Corriente', descripcion: 'Cuenta corriente con chequera', createdAt: new Date(), updatedAt: new Date() },
      { nombre: 'Plazo Fijo', descripcion: 'Inversión a plazo fijo', createdAt: new Date(), updatedAt: new Date() }
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('TipoCuentas');
  }
};
