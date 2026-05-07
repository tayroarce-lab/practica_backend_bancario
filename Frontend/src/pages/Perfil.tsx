import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Phone, CreditCard, Calendar, Shield, Lock, Save, Eye, EyeOff } from 'lucide-react';
import { usuarioService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Badge from '../components/ui/Badge';
import { toast } from 'sonner';

const Perfil: React.FC = () => {
  const { user, login } = useAuth();
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPwdSection, setShowPwdSection] = useState(false);
  const [showNewPwd, setShowNewPwd] = useState(false);

  const [form, setForm] = useState({
    nombre: user?.nombre || '',
    apellido: user?.apellido || '',
    telefono: user?.telefono || '',
    dui: user?.dui || '',
    fechaNacimiento: user?.fechaNacimiento || '',
  });

  const [pwdForm, setPwdForm] = useState({
    passwordActual: '',
    passwordNuevo: '',
    passwordConfirm: '',
  });

  const handleSavePerfil = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    try {
      const res = await usuarioService.actualizarUsuario(user.id, form);
      login(res.data);
      toast.success('Perfil actualizado correctamente');
      setEditMode(false);
    } catch {
      toast.error('Error al actualizar el perfil');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pwdForm.passwordNuevo !== pwdForm.passwordConfirm) {
      toast.error('Las contraseñas nuevas no coinciden');
      return;
    }
    if (pwdForm.passwordNuevo.length < 8) {
      toast.error('La nueva contraseña debe tener al menos 8 caracteres');
      return;
    }
    if (!user) return;
    setLoading(true);
    try {
      await usuarioService.actualizarUsuario(user.id, { password: pwdForm.passwordNuevo });
      toast.success('Contraseña actualizada correctamente');
      setPwdForm({ passwordActual: '', passwordNuevo: '', passwordConfirm: '' });
      setShowPwdSection(false);
    } catch {
      toast.error('Error al cambiar la contraseña');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  const initials = `${user.nombre?.[0] || ''}${user.apellido?.[0] || ''}`.toUpperCase();

  return (
    <div className="fade-in" style={{ padding: 'var(--space-8)', maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' }}>

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-6)' }}>
        <div style={{
          width: '72px', height: '72px', borderRadius: '50%',
          backgroundColor: 'rgba(201,168,76,0.15)',
          border: '2px solid var(--color-accent-500)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-accent-500)',
          flexShrink: 0
        }}>
          {initials}
        </div>
        <div>
          <p style={{ fontSize: 'var(--text-caption)', color: 'var(--color-accent-500)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            Mi Cuenta
          </p>
          <h1 className="h1" style={{ marginBottom: 'var(--space-1)' }}>
            {user.nombre} {user.apellido}
          </h1>
          <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center' }}>
            <Badge status={user.rol || 'cliente'} />
            <Badge status={user.activo ? 'activa' : 'inactiva'}>
              {user.activo ? 'Activo' : 'Inactivo'}
            </Badge>
          </div>
        </div>
      </motion.div>

      {/* Datos Personales */}
      <Card
        title="Datos Personales"
        subtitle="Información de contacto e identificación"
      >
        <form onSubmit={handleSavePerfil}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
            <Input
              label="Nombre"
              value={form.nombre}
              onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))}
              disabled={!editMode}
              icon={<User size={16} />}
            />
            <Input
              label="Apellido"
              value={form.apellido}
              onChange={e => setForm(f => ({ ...f, apellido: e.target.value }))}
              disabled={!editMode}
              icon={<User size={16} />}
            />
            <Input
              label="Teléfono"
              value={form.telefono}
              onChange={e => setForm(f => ({ ...f, telefono: e.target.value }))}
              disabled={!editMode}
              icon={<Phone size={16} />}
            />
            <Input
              label="DUI"
              value={form.dui}
              onChange={e => setForm(f => ({ ...f, dui: e.target.value }))}
              disabled={!editMode}
              icon={<CreditCard size={16} />}
            />
            <Input
              label="Fecha de Nacimiento"
              type="date"
              value={form.fechaNacimiento}
              onChange={e => setForm(f => ({ ...f, fechaNacimiento: e.target.value }))}
              disabled={!editMode}
              icon={<Calendar size={16} />}
            />
            {/* Email (solo lectura siempre) */}
            <Input
              label="Email"
              value={user.email}
              disabled
              icon={<Mail size={16} />}
            />
          </div>

          {/* Solo lectura: Rol */}
          <div style={{
            display: 'flex', gap: 'var(--space-4)', padding: 'var(--space-4)',
            backgroundColor: 'var(--color-bg-subtle)',
            borderRadius: 'var(--radius-md)', border: 'var(--border-subtle)',
            marginBottom: 'var(--space-6)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <Shield size={14} color="var(--color-text-muted)" />
              <span style={{ fontSize: 'var(--text-label)', color: 'var(--color-text-muted)', fontWeight: 600 }}>ROL:</span>
              <Badge status={user.rol || 'cliente'} />
            </div>
            <p style={{ fontSize: 'var(--text-caption)', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center' }}>
              El rol es asignado por administración.
            </p>
          </div>

          <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'flex-end' }}>
            {editMode ? (
              <>
                <Button type="button" variant="ghost" onClick={() => setEditMode(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={loading}>
                  <Save size={16} style={{ marginRight: 'var(--space-2)' }} />
                  {loading ? 'Guardando…' : 'Guardar Cambios'}
                </Button>
              </>
            ) : (
              <Button type="button" onClick={() => setEditMode(true)}>
                Editar Perfil
              </Button>
            )}
          </div>
        </form>
      </Card>

      {/* Cambio de Contraseña */}
      <Card title="Seguridad de Cuenta" subtitle="Gestión de credenciales de acceso">
        {!showPwdSection ? (
          <Button variant="secondary" onClick={() => setShowPwdSection(true)}>
            <Lock size={16} style={{ marginRight: 'var(--space-2)' }} />
            Cambiar Contraseña
          </Button>
        ) : (
          <form onSubmit={handleChangePassword}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', maxWidth: '400px' }}>
              <Input
                label="Contraseña Actual"
                type="password"
                value={pwdForm.passwordActual}
                onChange={e => setPwdForm(f => ({ ...f, passwordActual: e.target.value }))}
                required
                icon={<Lock size={16} />}
              />
              <div style={{ position: 'relative' }}>
                <Input
                  label="Nueva Contraseña"
                  type={showNewPwd ? 'text' : 'password'}
                  value={pwdForm.passwordNuevo}
                  onChange={e => setPwdForm(f => ({ ...f, passwordNuevo: e.target.value }))}
                  required
                  icon={<Lock size={16} />}
                />
                <button
                  type="button"
                  onClick={() => setShowNewPwd(v => !v)}
                  style={{ position: 'absolute', right: '12px', top: '38px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }}
                >
                  {showNewPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <Input
                label="Confirmar Nueva Contraseña"
                type="password"
                value={pwdForm.passwordConfirm}
                onChange={e => setPwdForm(f => ({ ...f, passwordConfirm: e.target.value }))}
                required
                icon={<Lock size={16} />}
              />
              <div style={{ display: 'flex', gap: 'var(--space-3)', marginTop: 'var(--space-2)' }}>
                <Button type="button" variant="ghost" onClick={() => { setShowPwdSection(false); setPwdForm({ passwordActual: '', passwordNuevo: '', passwordConfirm: '' }); }}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={loading}>
                  <Save size={16} style={{ marginRight: 'var(--space-2)' }} />
                  {loading ? 'Actualizando…' : 'Actualizar Contraseña'}
                </Button>
              </div>
            </div>
          </form>
        )}
      </Card>

    </div>
  );
};

export default Perfil;
