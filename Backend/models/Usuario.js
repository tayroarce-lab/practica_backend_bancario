const { DataTypes } = require('sequelize');
const { sequelize } = require('../database');
const bcrypt = require('bcrypt');

const Usuario = sequelize.define('Usuario', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nombre: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  apellido: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  email: {
    type: DataTypes.STRING(150),
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  telefono: {
    type: DataTypes.STRING(20)
  },
  dui: {
    type: DataTypes.STRING(20),
    unique: true
  },
  fechaNacimiento: {
    type: DataTypes.DATEONLY
  },
  activo: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  rol: {
    type: DataTypes.ENUM('admin', 'empleado', 'cliente'),
    allowNull: false,
    defaultValue: 'cliente'
  }
}, {
  tableName: 'Usuarios',
  timestamps: true,
  hooks: {
    beforeCreate: async (usuario) => {
      if (usuario.password) {
        const salt = await bcrypt.genSalt(10);
        usuario.password = await bcrypt.hash(usuario.password, salt);
      }
    },
    beforeUpdate: async (usuario) => {
      if (usuario.changed('password')) {
        const salt = await bcrypt.genSalt(10);
        usuario.password = await bcrypt.hash(usuario.password, salt);
      }
    }
  }
});

// Método de instancia para validar contraseña
Usuario.prototype.validarPassword = async function(passwordPlano) {
  return await bcrypt.compare(passwordPlano, this.password);
};

module.exports = Usuario;
