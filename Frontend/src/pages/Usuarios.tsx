import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { UserPlus, Trash2, Edit2, Search, Mail, Phone, User as UserIcon, Lock } from 'lucide-react';
import { usuarioService } from '../services/api';
import type { Usuario, CreateUsuarioDTO } from '../types';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Badge from '../components/ui/Badge';
import Skeleton from '../components/ui/Skeleton';
import { toast } from 'sonner';

const UsuariosPage: React.FC = () => {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<Usuario | null>(null);
  const [formData, setFormData] = useState<CreateUsuarioDTO>({ 
    nombre: '', 
    apellido: '', 
    email: '', 
    telefono: '', 
    password: '', 
    dui: '' 
  });

  const fetchUsuarios = async () => {
    try {
      const res = await usuarioService.getUsuarios();
      setUsuarios(res.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsuarios();
  }, []);

  const handleOpenCreate = () => {
    setEditingUser(null);
    setFormData({ nombre: '', apellido: '', email: '', telefono: '', password: '', dui: '' });
    setShowModal(true);
  };

  const handleOpenEdit = (user: Usuario) => {
    setEditingUser(user);
    setFormData({ 
      nombre: user.nombre, 
      apellido: user.apellido, 
      email: user.email, 
      telefono: user.telefono || '', 
      dui: user.dui || '',
      password: '' // No cargar password actual por seguridad
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingUser) {
        // En update, solo enviar password si se escribió algo
        const updateData = { ...formData };
        if (!updateData.password) delete updateData.password;
        
        await usuarioService.actualizarUsuario(editingUser.id, updateData);
        toast.success('Perfil de cliente actualizado con éxito');
      } else {
        await usuarioService.crearUsuario(formData);
        toast.success('Nuevo cliente registrado en el sistema');
      }
      setShowModal(false);
      fetchUsuarios();
    } catch (error: any) {
      // handled by interceptor
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('¿Estás seguro de eliminar este registro de cliente? Esta acción es irreversible.')) {
      try {
        await usuarioService.eliminarUsuario(id);
        toast.info('Registro de cliente desactivado');
        fetchUsuarios();
      } catch (error) {
        // handled by interceptor
      }
    }
  };

  return (
    <div className="fade-in">
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-10)' }}>
        <div>
          <h1 className="h1" style={{ marginBottom: 'var(--space-2)' }}>Directorio de Clientes</h1>
          <p className="text-secondary">Gestión de perfiles, credenciales y datos de contacto de alto patrimonio.</p>
        </div>
        <Button onClick={handleOpenCreate}>
          <UserPlus size={18} style={{ marginRight: 'var(--space-2)' }} /> Registrar Cliente
        </Button>
      </header>

      <Card title="Cartera de Clientes" subtitle="Listado centralizado de usuarios del sistema">
        <div style={{ position: 'relative', marginBottom: 'var(--space-6)', maxWidth: '400px' }}>
          <Search size={18} style={{ position: 'absolute', left: 'var(--space-4)', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
          <input 
            type="text" 
            placeholder="Buscar por nombre o email..." 
            style={{ 
              width: '100%', 
              padding: 'var(--space-3) var(--space-4) var(--space-3) var(--space-10)',
              backgroundColor: 'var(--color-primary-800)',
              border: 'var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              color: 'white',
              outline: 'none'
            }} 
          />
        </div>

        <div className="table-container">
          <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 8px' }}>
            <thead>
              <tr>
                <th style={{ padding: 'var(--space-4)', color: 'var(--color-text-muted)', fontWeight: 600, fontSize: 'var(--text-label)', textTransform: 'uppercase', textAlign: 'left' }}>Titular</th>
                <th style={{ padding: 'var(--space-4)', color: 'var(--color-text-muted)', fontWeight: 600, fontSize: 'var(--text-label)', textTransform: 'uppercase', textAlign: 'left' }}>Contacto</th>
                <th style={{ padding: 'var(--space-4)', color: 'var(--color-text-muted)', fontWeight: 600, fontSize: 'var(--text-label)', textTransform: 'uppercase', textAlign: 'left' }}>Rol</th>
                <th style={{ padding: 'var(--space-4)', color: 'var(--color-text-muted)', fontWeight: 600, fontSize: 'var(--text-label)', textTransform: 'uppercase', textAlign: 'right' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [1,2,3,4].map(i => (
                  <tr key={i}>
                    <td colSpan={4} style={{ padding: '8px' }}><Skeleton height="60px" /></td>
                  </tr>
                ))
              ) : usuarios.map((user) => (
                <tr key={user.id} style={{ backgroundColor: 'rgba(255,255,255,0.02)' }} className="row-hover">
                  <td style={{ padding: 'var(--space-4)', borderRadius: 'var(--radius-md) 0 0 var(--radius-md)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
                      <div style={{ 
                        width: '40px', 
                        height: '40px', 
                        borderRadius: '50%', 
                        backgroundColor: 'var(--color-bg-subtle)', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        color: 'var(--color-accent-500)',
                        border: 'var(--border-subtle)'
                      }}>
                        <UserIcon size={20} />
                      </div>
                      <div>
                        <p className="font-display" style={{ fontWeight: 600, color: 'white', margin: 0 }}>{user.nombre} {user.apellido}</p>
                        <p style={{ fontSize: '10px', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>ID: {user.id.toString().padStart(4, '0')}</p>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: 'var(--space-4)' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontSize: 'var(--text-body-sm)', color: 'var(--color-text-secondary)' }}>
                        <Mail size={12} /> {user.email}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontSize: 'var(--text-body-sm)', color: 'var(--color-text-muted)' }}>
                        <Phone size={12} /> {user.telefono || 'Sin registrar'}
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: 'var(--space-4)' }}>
                    <Badge status={user.rol === 'admin' ? 'aprobado' : user.rol === 'empleado' ? 'pendiente' : 'activa'}>
                      {user.rol}
                    </Badge>
                  </td>
                  <td style={{ padding: 'var(--space-4)', borderRadius: '0 var(--radius-md) var(--radius-md) 0', textAlign: 'right' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-2)' }}>
                      <Button variant="ghost" size="sm" onClick={() => handleOpenEdit(user)} style={{ padding: 'var(--space-2)' }}>
                        <Edit2 size={16} />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleDelete(user.id)}
                        style={{ padding: 'var(--space-2)', color: 'var(--color-error-500)' }}
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(8px)' }}>
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={{ width: '100%', maxWidth: '520px' }}>
            <Card 
              title={editingUser ? "Edición de Perfil" : "Registro de Nuevo Cliente"} 
              subtitle={editingUser ? `Modificando registro de ${editingUser.nombre}` : "Ingrese los datos de identidad y contacto"}
            >
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                  <Input 
                    label="Nombre"
                    required
                    icon={<UserIcon size={16} />}
                    value={formData.nombre}
                    onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                  />
                  <Input 
                    label="Apellido"
                    required
                    icon={<UserIcon size={16} />}
                    value={formData.apellido}
                    onChange={(e) => setFormData({...formData, apellido: e.target.value})}
                  />
                </div>
                
                <Input 
                  label="Email Corporativo / Personal"
                  type="email"
                  required
                  icon={<Mail size={16} />}
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                  <Input 
                    label="Teléfono"
                    icon={<Phone size={16} />}
                    value={formData.telefono}
                    onChange={(e) => setFormData({...formData, telefono: e.target.value})}
                  />
                  <Input 
                    label="Documento (DUI/ID)"
                    required
                    value={formData.dui}
                    onChange={(e) => setFormData({...formData, dui: e.target.value})}
                  />
                </div>

                <Input 
                  label={editingUser ? "Nueva Contraseña (dejar vacío para mantener)" : "Contraseña de Acceso"}
                  type="password"
                  required={!editingUser}
                  minLength={8}
                  icon={<Lock size={16} />}
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                />

                <div style={{ display: 'flex', gap: 'var(--space-4)', marginTop: 'var(--space-4)' }}>
                  <Button type="button" variant="ghost" fullWidth onClick={() => setShowModal(false)}>Cancelar</Button>
                  <Button type="submit" fullWidth>{editingUser ? 'Guardar Cambios' : 'Finalizar Registro'}</Button>
                </div>
              </form>
            </Card>
          </motion.div>
        </div>
      )}

      <style>{`
        .row-hover:hover {
          background-color: rgba(201, 168, 76, 0.05) !important;
        }
      `}</style>
    </div>
  );
};

export default UsuariosPage;
