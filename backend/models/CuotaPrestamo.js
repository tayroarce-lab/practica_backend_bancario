// FILE: models/CuotaPrestamo.js
/**
 * Modelo CuotaPrestamo — Tabla de amortización: una fila por cuota de cada préstamo.
 */
'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class CuotaPrestamo extends Model {
    static associate(models) {
      CuotaPrestamo.belongsTo(models.Prestamo, { foreignKey: 'prestamo_id' });
    }
  }

  CuotaPrestamo.init(
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false },
      prestamo_id: { type: DataTypes.INTEGER, allowNull: false },
      numero_cuota: { type: DataTypes.INTEGER, allowNull: false },
      monto_cuota: { type: DataTypes.DECIMAL(15, 2), allowNull: false },
      monto_capital: { type: DataTypes.DECIMAL(15, 2), allowNull: false },
      monto_interes: { type: DataTypes.DECIMAL(15, 2), allowNull: false },
      fecha_vencimiento: { type: DataTypes.DATEONLY, allowNull: false },
      fecha_pago: { type: DataTypes.DATEONLY, allowNull: true },
      estado: {
        type: DataTypes.ENUM('pendiente', 'pagada', 'vencida'),
        allowNull: false, defaultValue: 'pendiente',
      },
    },
    { sequelize, modelName: 'CuotaPrestamo', tableName: 'cuotas_prestamo', underscored: true, timestamps: true }
  );

  return CuotaPrestamo;
};
