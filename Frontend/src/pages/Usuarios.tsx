import React, { useEffect, useState } from 'react';
import { UserPlus, Trash2, Edit2, Search, Mail, Phone, User as UserIcon } from 'lucide-react';
import { usuarioService } from '../services/api';
import type { Usuario } from '../types';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Skeleton from '../components/ui/Skeleton';
import { toast } from 'sonner';
import Modal from '../components/ui/Modal';
import UserForm from '../components/usuarios/UserForm';

const UsuariosPage: React.FC = () => {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<Usuario | null>(null);

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
    
    // Check if we should open the modal automatically (from sidebar quick action)
    const params = new URLSearchParams(window.location.search);
    if (params.get('create') === 'true') {
      setShowModal(true);
      // Clean the URL without reloading
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  const handleOpenCreate = () => {
    setEditingUser(null);
    setShowModal(true);
  };

  const handleOpenEdit = () => {
    toast.info('La edición de usuarios se implementará en la siguiente fase.');
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
          <h1 className="h1" style={{ marginBottom: 'var(--space-2)' }}>Gestión de Usuarios</h1>
          <p className="text-secondary">Control de acceso y perfiles para administradores, empleados y clientes.</p>
        </div>
        <Button onClick={handleOpenCreate}>
          <UserPlus size={18} style={{ marginRight: 'var(--space-2)' }} /> Registrar Usuario
        </Button>
      </header>

      <Card title="Directorio de Usuarios" subtitle="Listado centralizado de personal y clientes">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-6)', gap: 'var(--space-4)', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
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
          <Button onClick={handleOpenCreate}>
            <UserPlus size={18} style={{ marginRight: 'var(--space-2)' }} /> Registrar Usuario
          </Button>
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
                      <Button variant="ghost" size="sm" onClick={handleOpenEdit} style={{ padding: 'var(--space-2)' }}>
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

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingUser ? "Editar Usuario" : "Registrar Nuevo Usuario"}
      >
        <UserForm 
          onSuccess={() => {
            setShowModal(false);
            fetchUsuarios();
          }}
          onCancel={() => setShowModal(false)}
        />
      </Modal>

      <style>{`
        .row-hover:hover {
          background-color: rgba(201, 168, 76, 0.05) !important;
        }
      `}</style>
    </div>
  );
};

export default UsuariosPage;
