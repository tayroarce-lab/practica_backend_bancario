const { DataTypes } = require('sequelize');
const { sequelize } = require('../database');

const Prestamo = sequelize.define('Prestamo', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  monto: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
    validate: {
      min: 0.01
    }
  },
  tasaInteres: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false,
    validate: {
      min: 0.01 // Tasa mayor a 0
    }
  },
  plazoMeses: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1 // Plazo mayor a 0
    }
  },
  cuotaMensual: {
    type: DataTypes.DECIMAL(15, 2)
  },
  estado: {
    type: DataTypes.ENUM('pendiente', 'aprobado', 'rechazado', 'pagado'),
    defaultValue: 'pendiente'
  },
  usuarioId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  cuentaDesembolsoId: {
    type: DataTypes.INTEGER,
    allowNull: true // Requerido al aprobar
  }
}, {
  tableName: 'Prestamos',
  timestamps: true
});

module.exports = Prestamo;
