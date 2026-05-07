import React, { useState, useEffect } from 'react';
import { UserPlus, Mail, Lock, UserCheck, Phone, CreditCard, Calendar, Save } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { usuarioService } from '../../services/api';
import { toast } from 'sonner';
import Input from '../ui/Input';
import Button from '../ui/Button';

import type { CreateUsuarioDTO, Usuario } from '../../types';

interface UserFormProps {
  onSuccess: () => void;
  onCancel: () => void;
  editingUser?: Usuario | null;
}

const UserForm: React.FC<UserFormProps> = ({ onSuccess, onCancel, editingUser }) => {
  const { user: currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const isEditing = !!editingUser;

  const [formData, setFormData] = useState<CreateUsuarioDTO>({
    nombre: '',
    apellido: '',
    email: '',
    password: '',
    rol: 'cliente',
    telefono: '',
    dui: '',
    fechaNacimiento: ''
  });

  // Pre-rellenar el formulario cuando se edita un usuario
  useEffect(() => {
    if (editingUser) {
      setFormData({
        nombre: editingUser.nombre || '',
        apellido: editingUser.apellido || '',
        email: editingUser.email || '',
        password: '', // No rellenar la contraseña al editar
        rol: editingUser.rol || 'cliente',
        telefono: editingUser.telefono || '',
        dui: editingUser.dui || '',
        fechaNacimiento: editingUser.fechaNacimiento || ''
      });
    }
  }, [editingUser]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isEditing && editingUser) {
        // Editar: no enviar password si está vacío
        const updateData: Partial<CreateUsuarioDTO> = { ...formData };
        if (!updateData.password) {
          delete updateData.password;
        }
        await usuarioService.actualizarUsuario(editingUser.id, updateData);
        toast.success('Usuario actualizado correctamente');
      } else {
        // Crear
        await usuarioService.crearUsuario(formData);
        toast.success('Usuario registrado correctamente');
      }
      onSuccess();
    } catch (error: any) {
      console.error(error);
      const msg = error.response?.data?.error || (isEditing ? 'Error al actualizar el usuario' : 'Error al registrar el usuario');
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  // Roles disponibles según el rol del usuario que gestiona
  const availableRoles = currentUser?.rol === 'admin'
    ? ['admin', 'empleado', 'cliente']
    : ['cliente'];

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
        <Input
          label="Nombre"
          name="nombre"
          value={formData.nombre}
          onChange={handleChange}
          required
          icon={<UserPlus size={18} />}
          placeholder="Ej. Juan"
        />
        <Input
          label="Apellido"
          name="apellido"
          value={formData.apellido}
          onChange={handleChange}
          required
          placeholder="Ej. Pérez"
        />
      </div>

      <Input
        label="Email"
        name="email"
        type="email"
        value={formData.email}
        onChange={handleChange}
        required
        disabled={isEditing} // Email no editable
        icon={<Mail size={18} />}
        placeholder="juan.perez@ejemplo.com"
      />

      <Input
        label={isEditing ? 'Nueva Contraseña (dejar vacío para no cambiar)' : 'Contraseña'}
        name="password"
        type="password"
        value={formData.password}
        onChange={handleChange}
        required={!isEditing}
        icon={<Lock size={18} />}
        placeholder="••••••••"
      />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
        <Input
          label="Teléfono"
          name="telefono"
          value={formData.telefono}
          onChange={handleChange}
          icon={<Phone size={18} />}
          placeholder="Ej. 7766-5544"
        />
        <Input
          label="DUI"
          name="dui"
          value={formData.dui}
          onChange={handleChange}
          icon={<CreditCard size={18} />}
          placeholder="00000000-0"
        />
      </div>

      <Input
        label="Fecha de Nacimiento"
        name="fechaNacimiento"
        type="date"
        value={formData.fechaNacimiento}
        onChange={handleChange}
        icon={<Calendar size={18} />}
      />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
        <label style={{
          color: 'var(--color-text-secondary)',
          fontSize: 'var(--text-body-sm)',
          fontWeight: 500
        }}>
          Rol del Usuario
        </label>
        <div style={{ position: 'relative' }}>
          <select
            name="rol"
            value={formData.rol}
            onChange={handleChange}
            style={{
              width: '100%',
              padding: '0.75rem 1rem 0.75rem 2.75rem',
              backgroundColor: 'var(--color-bg-input)',
              border: 'var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              color: 'white',
              fontSize: '1rem',
              appearance: 'none',
              cursor: 'pointer',
              outline: 'none',
              transition: 'all 0.2s'
            }}
          >
            {availableRoles.map(rol => (
              <option key={rol} value={rol}>
                {rol.charAt(0).toUpperCase() + rol.slice(1)}
              </option>
            ))}
          </select>
          <div style={{
            position: 'absolute',
            left: '1rem',
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'var(--color-accent-500)',
            pointerEvents: 'none'
          }}>
            <UserCheck size={18} />
          </div>
        </div>
      </div>

      <div style={{
        display: 'flex',
        gap: 'var(--space-3)',
        marginTop: 'var(--space-4)',
        paddingTop: 'var(--space-4)',
        borderTop: 'var(--border-subtle)'
      }}>
        <Button
          type="button"
          variant="ghost"
          onClick={onCancel}
          fullWidth
          disabled={loading}
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          fullWidth
          loading={loading}
        >
          {isEditing
            ? <><Save size={16} style={{ marginRight: 'var(--space-2)' }} />Guardar Cambios</>
            : 'Registrar Usuario'
          }
        </Button>
      </div>
    </form>
  );
};

export default UserForm;
