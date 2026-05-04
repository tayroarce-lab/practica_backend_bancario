import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, Plus, ArrowUpRight, ArrowDownLeft, Lock, Unlock } from 'lucide-react';
import { cuentaService, usuarioService } from '../services/api';
import type { Cuenta, Usuario } from '../types';

const CuentasPage: React.FC = () => {
  const [cuentas, setCuentas] = useState<Cuenta[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showActionModal, setShowActionModal] = useState<'deposito' | 'retiro' | null>(null);
  const [selectedCuenta, setSelectedCuenta] = useState<Cuenta | null>(null);
  const [monto, setMonto] = useState('');
  const [newCuenta, setNewCuenta] = useState({ usuarioId: '', tipoCuentaId: '1', saldoInicial: '0' });

  const fetchData = async () => {
    try {
      const [resCuentas, resUsuarios] = await Promise.all([
        cuentaService.getCuentas(),
        usuarioService.getUsuarios()
      ]);
      setCuentas(resCuentas.data);
      setUsuarios(resUsuarios.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await cuentaService.crearCuenta({
        usuarioId: Number(newCuenta.usuarioId),
        tipoCuentaId: Number(newCuenta.tipoCuentaId),
        saldoInicial: Number(newCuenta.saldoInicial)
      });
      setShowModal(false);
      fetchData();
    } catch (error: any) {
      alert(error.message || 'Error al crear cuenta');
    }
  };

  const handleAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCuenta) return;
    try {
      if (showActionModal === 'deposito') {
        await cuentaService.depositar(selectedCuenta.id, Number(monto));
      } else {
        await cuentaService.retirar(selectedCuenta.id, Number(monto));
      }
      setShowActionModal(null);
      setMonto('');
      fetchData();
    } catch (error) {
      alert('Error al procesar la operación');
    }
  };

  const toggleEstado = async (cuenta: Cuenta) => {
    try {
      const nuevoEstado = cuenta.estado === 'activa' ? 'bloqueada' : 'activa';
      await cuentaService.actualizarEstado(cuenta.id, nuevoEstado);
      fetchData();
    } catch (error) {
      alert('Error al cambiar estado');
    }
  };

  return (
    <div className="fade-in">
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
        <div>
          <h1 style={{ fontSize: '2.25rem', marginBottom: '0.5rem' }}>Cuentas Bancarias</h1>
          <p style={{ color: 'var(--text-muted)' }}>Gestión de saldos, estados y tipos de cuenta.</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          style={{ 
            backgroundColor: 'var(--accent)', 
            color: 'white', 
            padding: '0.75rem 1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '1rem'
          }}
        >
          <Plus size={20} /> Nueva Cuenta
        </button>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.5rem' }}>
        {loading ? (
          <p>Cargando cuentas...</p>
        ) : cuentas.map((cuenta) => (
          <motion.div
            key={cuenta.id}
            whileHover={{ y: -5 }}
            className="glass"
            style={{ 
              padding: '1.5rem', 
              borderRadius: 'var(--radius)', 
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <div style={{ 
              position: 'absolute', 
              top: 0, 
              right: 0, 
              padding: '0.5rem 1rem', 
              backgroundColor: cuenta.estado === 'activa' ? 'var(--success)20' : 'var(--error)20',
              color: cuenta.estado === 'activa' ? 'var(--success)' : 'var(--error)',
              fontSize: '0.75rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              borderBottomLeftRadius: 'var(--radius)'
            }}>
              {cuenta.estado}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
              <div style={{ 
                width: '48px', 
                height: '48px', 
                borderRadius: '12px', 
                backgroundColor: 'var(--primary-light)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                color: 'var(--accent)'
              }}>
                <CreditCard size={24} />
              </div>
              <div>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{cuenta.tipoCuenta?.nombre || 'Cuenta Corriente'}</p>
                <h3 style={{ fontSize: '1.125rem' }}>{cuenta.numeroCuenta}</h3>
              </div>
            </div>

            <div style={{ marginBottom: '2rem' }}>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Saldo Disponible</p>
              <h2 style={{ fontSize: '2rem', color: 'var(--success)' }}>${Number(cuenta.saldo).toLocaleString()}</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.5rem' }}>Titular: {cuenta.usuario?.nombre}</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
              <button 
                disabled={cuenta.estado === 'bloqueada'}
                onClick={() => { setSelectedCuenta(cuenta); setShowActionModal('deposito'); }}
                style={{ 
                  backgroundColor: 'var(--primary-light)', 
                  padding: '0.625rem', 
                  fontSize: '0.75rem',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.25rem',
                  opacity: cuenta.estado === 'bloqueada' ? 0.5 : 1
                }}
              >
                <ArrowDownLeft size={16} /> Depósito
              </button>
              <button 
                disabled={cuenta.estado === 'bloqueada'}
                onClick={() => { setSelectedCuenta(cuenta); setShowActionModal('retiro'); }}
                style={{ 
                  backgroundColor: 'var(--primary-light)', 
                  padding: '0.625rem', 
                  fontSize: '0.75rem',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.25rem',
                  opacity: cuenta.estado === 'bloqueada' ? 0.5 : 1
                }}
              >
                <ArrowUpRight size={16} /> Retiro
              </button>
              <button 
                onClick={() => toggleEstado(cuenta)}
                style={{ 
                  backgroundColor: 'var(--primary-light)', 
                  padding: '0.625rem', 
                  fontSize: '0.75rem',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.25rem'
                }}
              >
                {cuenta.estado === 'activa' ? <Lock size={16} /> : <Unlock size={16} />} 
                {cuenta.estado === 'activa' ? 'Bloquear' : 'Activar'}
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Modal Crear Cuenta */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' }}>
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="glass" style={{ padding: '2.5rem', borderRadius: 'var(--radius)', width: '100%', maxWidth: '500px' }}>
            <h2 style={{ marginBottom: '1.5rem' }}>Abrir Nueva Cuenta</h2>
            <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontSize: '0.875rem', fontWeight: 600 }}>Usuario / Titular</label>
                <select 
                  required
                  style={{ width: '100%' }}
                  value={newCuenta.usuarioId}
                  onChange={(e) => setNewCuenta({...newCuenta, usuarioId: e.target.value})}
                >
                  <option value="">Seleccione un usuario</option>
                  {usuarios.map(u => <option key={u.id} value={u.id}>{u.nombre}</option>)}
                </select>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontSize: '0.875rem', fontWeight: 600 }}>Tipo de Cuenta</label>
                <select 
                  style={{ width: '100%' }}
                  value={newCuenta.tipoCuentaId}
                  onChange={(e) => setNewCuenta({...newCuenta, tipoCuentaId: e.target.value})}
                >
                  <option value="1">Cuenta de Ahorros</option>
                  <option value="2">Cuenta Corriente</option>
                  <option value="3">Cuenta Nómina</option>
                </select>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontSize: '0.875rem', fontWeight: 600 }}>Saldo Inicial</label>
                <input 
                  type="number"
                  min="0"
                  style={{ width: '100%' }}
                  value={newCuenta.saldoInicial}
                  onChange={(e) => setNewCuenta({...newCuenta, saldoInicial: e.target.value})}
                />
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ flex: 1, padding: '0.75rem', backgroundColor: 'var(--primary-light)', border: '1px solid var(--border)', color: 'var(--text)' }}>Cancelar</button>
                <button type="submit" style={{ flex: 1, padding: '0.75rem', backgroundColor: 'var(--accent)', color: 'white' }}>Crear Cuenta</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Modal Operaciones (Depósito/Retiro) */}
      {showActionModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' }}>
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="glass" style={{ padding: '2.5rem', borderRadius: 'var(--radius)', width: '100%', maxWidth: '400px' }}>
            <h2 style={{ marginBottom: '0.5rem', textTransform: 'capitalize' }}>{showActionModal}</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Cuenta: {selectedCuenta?.numeroCuenta}</p>
            <form onSubmit={handleAction} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontSize: '0.875rem', fontWeight: 600 }}>Monto a {showActionModal}</label>
                <input 
                  type="number"
                  required
                  min="1"
                  autoFocus
                  style={{ width: '100%', fontSize: '1.5rem', textAlign: 'center' }}
                  value={monto}
                  onChange={(e) => setMonto(e.target.value)}
                />
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button type="button" onClick={() => setShowActionModal(null)} style={{ flex: 1, padding: '0.75rem', backgroundColor: 'var(--primary-light)', border: '1px solid var(--border)', color: 'var(--text)' }}>Cancelar</button>
                <button type="submit" style={{ flex: 1, padding: '0.75rem', backgroundColor: showActionModal === 'deposito' ? 'var(--success)' : 'var(--accent)', color: 'white' }}>
                  Confirmar {showActionModal === 'deposito' ? 'Depósito' : 'Retiro'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default CuentasPage;
