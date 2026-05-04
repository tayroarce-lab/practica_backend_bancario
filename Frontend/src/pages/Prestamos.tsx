import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, CheckCircle, XCircle, Clock } from 'lucide-react';
import { prestamoService, usuarioService, cuentaService } from '../services/api';
import type { Prestamo, Usuario, Cuenta } from '../types';

const PrestamosPage: React.FC = () => {
  const [prestamos, setPrestamos] = useState<Prestamo[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newPrestamo, setNewPrestamo] = useState({ 
    usuarioId: '', 
    monto: '', 
    plazoMeses: '12', 
    tasaInteres: '5.5' 
  });
  const [selectedPrestamo, setSelectedPrestamo] = useState<Prestamo | null>(null);
  const [userAccounts, setUserAccounts] = useState<Cuenta[]>([]);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [selectedAccountId, setSelectedAccountId] = useState('');

  const fetchData = async () => {
    try {
      const [resPrestamos, resUsuarios] = await Promise.all([
        prestamoService.getPrestamos(),
        usuarioService.getUsuarios()
      ]);
      setPrestamos(resPrestamos.data);
      setUsuarios(resUsuarios.data);
    } catch (error) {
      console.error('Error fetching loans:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await prestamoService.solicitarPrestamo({
        usuarioId: Number(newPrestamo.usuarioId),
        monto: Number(newPrestamo.monto),
        plazoMeses: Number(newPrestamo.plazoMeses),
        tasaInteres: Number(newPrestamo.tasaInteres)
      });
      setShowModal(false);
      fetchData();
    } catch (error: any) {
      alert(error.message || 'Error al solicitar préstamo');
    }
  };

  const openApproval = async (prestamo: Prestamo) => {
    try {
      const res = await cuentaService.getCuentasPorUsuario(prestamo.usuarioId);
      const activeAccounts = res.data.filter(c => c.estado === 'activa');
      if (activeAccounts.length === 0) {
        alert('El usuario no tiene cuentas activas para recibir el desembolso.');
        return;
      }
      setUserAccounts(activeAccounts);
      setSelectedPrestamo(prestamo);
      setSelectedAccountId(activeAccounts[0].id.toString());
      setShowApprovalModal(true);
    } catch (error) {
      alert('Error al cargar cuentas del usuario');
    }
  };

  const handleApprove = async () => {
    if (!selectedPrestamo || !selectedAccountId) return;
    try {
      await prestamoService.aprobarPrestamo(selectedPrestamo.id, Number(selectedAccountId));
      setShowApprovalModal(false);
      fetchData();
    } catch (error: any) {
      alert(error.message || 'Error al aprobar préstamo');
    }
  };

  const handleStatus = async (id: number) => {
    try {
      await prestamoService.rechazarPrestamo(id);
      fetchData();
    } catch (error) {
      alert('Error al actualizar estado del préstamo');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'aprobado': return 'var(--success)';
      case 'rechazado': return 'var(--error)';
      default: return 'var(--warning)';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'aprobado': return <CheckCircle size={18} />;
      case 'rechazado': return <XCircle size={18} />;
      default: return <Clock size={18} />;
    }
  };

  return (
    <div className="fade-in">
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
        <div>
          <h1 style={{ fontSize: '2.25rem', marginBottom: '0.5rem' }}>Gestión de Préstamos</h1>
          <p style={{ color: 'var(--text-muted)' }}>Solicitudes de crédito, aprobación y seguimiento.</p>
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
          <Plus size={20} /> Solicitar Préstamo
        </button>
      </header>

      <div className="glass" style={{ borderRadius: 'var(--radius)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ backgroundColor: 'rgba(255,255,255,0.03)' }}>
              <th style={{ padding: '1.25rem 1.5rem', color: 'var(--text-muted)', fontWeight: 600 }}>Usuario</th>
              <th style={{ padding: '1.25rem 1.5rem', color: 'var(--text-muted)', fontWeight: 600 }}>Monto</th>
              <th style={{ padding: '1.25rem 1.5rem', color: 'var(--text-muted)', fontWeight: 600 }}>Términos</th>
              <th style={{ padding: '1.25rem 1.5rem', color: 'var(--text-muted)', fontWeight: 600 }}>Estado</th>
              <th style={{ padding: '1.25rem 1.5rem', color: 'var(--text-muted)', fontWeight: 600, textAlign: 'right' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} style={{ textAlign: 'center', padding: '3rem' }}>Cargando préstamos...</td></tr>
            ) : prestamos.length === 0 ? (
              <tr><td colSpan={5} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>No hay solicitudes registradas.</td></tr>
            ) : prestamos.map((p) => (
              <tr key={p.id} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '1.25rem 1.5rem' }}>
                  <div style={{ fontWeight: 600 }}>{p.usuario?.nombre || 'Cliente'}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>ID: {p.id}</div>
                </td>
                <td style={{ padding: '1.25rem 1.5rem', fontSize: '1.125rem', fontWeight: 700 }}>
                  ${Number(p.monto).toLocaleString()}
                </td>
                <td style={{ padding: '1.25rem 1.5rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                  <div>{p.plazoMeses} meses</div>
                  <div>Tasa: {p.tasaInteres}%</div>
                </td>
                <td style={{ padding: '1.25rem 1.5rem' }}>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '0.5rem', 
                    color: getStatusColor(p.estado),
                    textTransform: 'capitalize',
                    fontWeight: 600
                  }}>
                    {getStatusIcon(p.estado)}
                    {p.estado}
                  </div>
                </td>
                <td style={{ padding: '1.25rem 1.5rem', textAlign: 'right' }}>
                  {p.estado === 'pendiente' ? (
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                      <button 
                        onClick={() => openApproval(p)}
                        style={{ padding: '0.5rem 1rem', backgroundColor: 'var(--success)20', color: 'var(--success)', border: '1px solid var(--success)40' }}
                      >
                        Aprobar
                      </button>
                      <button 
                        onClick={() => handleStatus(p.id)}
                        style={{ padding: '0.5rem 1rem', backgroundColor: 'var(--error)20', color: 'var(--error)', border: '1px solid var(--error)40' }}
                      >
                        Rechazar
                      </button>
                    </div>
                  ) : (
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Finalizado</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' }}>
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="glass" style={{ padding: '2.5rem', borderRadius: 'var(--radius)', width: '100%', maxWidth: '500px' }}>
            <h2 style={{ marginBottom: '1.5rem' }}>Nueva Solicitud de Préstamo</h2>
            <form onSubmit={handleRequest} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontSize: '0.875rem', fontWeight: 600 }}>Usuario Solicitante</label>
                <select 
                  required
                  style={{ width: '100%' }}
                  value={newPrestamo.usuarioId}
                  onChange={(e) => setNewPrestamo({...newPrestamo, usuarioId: e.target.value})}
                >
                  <option value="">Seleccione un usuario</option>
                  {usuarios.map(u => <option key={u.id} value={u.id}>{u.nombre}</option>)}
                </select>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontSize: '0.875rem', fontWeight: 600 }}>Monto del Préstamo</label>
                <input 
                  type="number"
                  required
                  min="100"
                  style={{ width: '100%' }}
                  value={newPrestamo.monto}
                  onChange={(e) => setNewPrestamo({...newPrestamo, monto: e.target.value})}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={{ fontSize: '0.875rem', fontWeight: 600 }}>Plazo (Meses)</label>
                  <input 
                    type="number"
                    required
                    min="1"
                    style={{ width: '100%' }}
                    value={newPrestamo.plazoMeses}
                    onChange={(e) => setNewPrestamo({...newPrestamo, plazoMeses: e.target.value})}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={{ fontSize: '0.875rem', fontWeight: 600 }}>Tasa Interés (%)</label>
                  <input 
                    type="number"
                    step="0.1"
                    required
                    min="0"
                    style={{ width: '100%' }}
                    value={newPrestamo.tasaInteres}
                    onChange={(e) => setNewPrestamo({...newPrestamo, tasaInteres: e.target.value})}
                  />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ flex: 1, padding: '0.75rem', backgroundColor: 'var(--primary-light)', border: '1px solid var(--border)', color: 'var(--text)' }}>Cancelar</button>
                <button type="submit" style={{ flex: 1, padding: '0.75rem', backgroundColor: 'var(--accent)', color: 'white' }}>Enviar Solicitud</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
      {/* Modal Aprobación (Selección de cuenta) */}
      {showApprovalModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' }}>
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="glass" style={{ padding: '2.5rem', borderRadius: 'var(--radius)', width: '100%', maxWidth: '400px' }}>
            <h2 style={{ marginBottom: '0.5rem' }}>Aprobar Préstamo</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Seleccione la cuenta para el desembolso de ${Number(selectedPrestamo?.monto).toLocaleString()}</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontSize: '0.875rem', fontWeight: 600 }}>Cuenta de Destino</label>
                <select 
                  required
                  style={{ width: '100%' }}
                  value={selectedAccountId}
                  onChange={(e) => setSelectedAccountId(e.target.value)}
                >
                  {userAccounts.map(c => (
                    <option key={c.id} value={c.id}>{c.numeroCuenta} - ${Number(c.saldo).toLocaleString()}</option>
                  ))}
                </select>
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button type="button" onClick={() => setShowApprovalModal(false)} style={{ flex: 1, padding: '0.75rem', backgroundColor: 'var(--primary-light)', border: '1px solid var(--border)', color: 'var(--text)' }}>Cancelar</button>
                <button onClick={handleApprove} style={{ flex: 1, padding: '0.75rem', backgroundColor: 'var(--success)', color: 'white' }}>Confirmar Desembolso</button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default PrestamosPage;
