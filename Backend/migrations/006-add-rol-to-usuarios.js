'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Usuarios', 'rol', {
      type: Sequelize.ENUM('admin', 'empleado', 'cliente'),
      allowNull: false,
      defaultValue: 'cliente'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Usuarios', 'rol');
    // Nota: Dependiendo del dialecto (ej. MySQL), el tipo ENUM podría persistir en la DB 
    // pero la columna se elimina correctamente.
  }
};
