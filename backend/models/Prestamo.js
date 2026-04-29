// FILE: models/Prestamo.js
/**
 * Modelo Prestamo — Solicitudes y gestión del ciclo de vida de créditos.
 * Tiene dos FK: usuario_id y cuenta_desembolso_id (alias CuentaDesembolso).
 */
'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Prestamo extends Model {
    static associate(models) {
      Prestamo.belongsTo(models.Usuario, { foreignKey: 'usuario_id' });
      Prestamo.belongsTo(models.Cuenta, { as: 'CuentaDesembolso', foreignKey: 'cuenta_desembolso_id' });
      Prestamo.hasMany(models.CuotaPrestamo, { foreignKey: 'prestamo_id' });
    }
  }

  Prestamo.init(
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false },
      usuario_id: { type: DataTypes.INTEGER, allowNull: false },
      cuenta_desembolso_id: { type: DataTypes.INTEGER, allowNull: false },
      monto_solicitado: { type: DataTypes.DECIMAL(15, 2), allowNull: false },
      monto_aprobado: { type: DataTypes.DECIMAL(15, 2), allowNull: true },
      tasa_interes: { type: DataTypes.DECIMAL(5, 2), allowNull: false },
      plazo_meses: { type: DataTypes.INTEGER, allowNull: false },
      estado: {
        type: DataTypes.ENUM('solicitado', 'aprobado', 'rechazado', 'activo', 'pagado', 'moroso'),
        allowNull: false, defaultValue: 'solicitado',
      },
      fecha_solicitud: { type: DataTypes.DATEONLY, allowNull: false },
      fecha_aprobacion: { type: DataTypes.DATEONLY, allowNull: true },
    },
    { sequelize, modelName: 'Prestamo', tableName: 'prestamos', underscored: true, timestamps: true }
  );

  return Prestamo;
};
