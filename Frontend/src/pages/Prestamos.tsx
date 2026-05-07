import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, CheckCircle, XCircle, Clock, Landmark, Calculator } from 'lucide-react';
import { prestamoService, usuarioService, cuentaService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import type { Prestamo, Usuario, Cuenta } from '../types';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Badge from '../components/ui/Badge';
import Skeleton from '../components/ui/Skeleton';
import { toast } from 'sonner';

const PrestamosPage: React.FC = () => {
  const [prestamos, setPrestamos] = useState<Prestamo[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const { user } = useAuth();
  const isClient = user?.rol === 'cliente';

  const [newPrestamo, setNewPrestamo] = useState({ 
    usuarioId: user?.id?.toString() || '', 
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
      const prestamoRes = await prestamoService.getPrestamos();
      setPrestamos(prestamoRes.data);

      // Solo admin/empleado necesitan la lista de usuarios (para el formulario de solicitud)
      if (!isClient) {
        const usuariosRes = await usuarioService.getUsuarios();
        setUsuarios(usuariosRes.data);
      }
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
      toast.success('Solicitud de préstamo emitida correctamente');
      fetchData();
    } catch (error: any) {
      // handled by interceptor
    }
  };

  const openApproval = async (prestamo: Prestamo) => {
    try {
      const res = await cuentaService.getCuentasPorUsuario(prestamo.usuarioId);
      const activeAccounts = res.data.filter(c => c.estado === 'activa');
      if (activeAccounts.length === 0) {
        toast.error('El usuario no tiene cuentas activas para recibir el desembolso.');
        return;
      }
      setUserAccounts(activeAccounts);
      setSelectedPrestamo(prestamo);
      setSelectedAccountId(activeAccounts[0].id.toString());
      setShowApprovalModal(true);
    } catch (error) {
      toast.error('Error al cargar cuentas del usuario');
    }
  };

  const handleApprove = async () => {
    if (!selectedPrestamo || !selectedAccountId) return;
    try {
      await prestamoService.aprobarPrestamo(selectedPrestamo.id, Number(selectedAccountId));
      setShowApprovalModal(false);
      toast.success('Préstamo aprobado y fondos desembolsados');
      fetchData();
    } catch (error: any) {
      // handled by interceptor
    }
  };

  const handleStatus = async (id: number) => {
    if (!confirm('¿Desea denegar formalmente esta solicitud de crédito?')) return;
    try {
      await prestamoService.rechazarPrestamo(id);
      toast.info('Solicitud de préstamo rechazada');
      fetchData();
    } catch (error) {
      // handled by interceptor
    }
  };

  return (
    <div className="fade-in">
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-10)' }}>
        <div>
          <h1 className="h1" style={{ marginBottom: 'var(--space-2)' }}>{isClient ? 'Mis Créditos' : 'Líneas de Crédito'}</h1>
          <p className="text-secondary">{isClient ? 'Seguimiento de sus financiamientos y estados de cuenta.' : 'Gestión de capital circulante y financiamiento institucional.'}</p>
        </div>
        <Button onClick={() => {
          setNewPrestamo(prev => ({ ...prev, usuarioId: user?.id?.toString() || '' }));
          setShowModal(true);
        }}>
          <Plus size={18} style={{ marginRight: 'var(--space-2)' }} /> Solicitar Financiamiento
        </Button>
      </header>

      <Card title="Solicitudes de Activos" subtitle="Auditoría de solicitudes de crédito y estados de aprobación">
        <div className="table-container">
          <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 8px' }}>
            <thead>
              <tr>
                {!isClient && <th style={{ padding: 'var(--space-4)', color: 'var(--color-text-muted)', fontWeight: 600, fontSize: 'var(--text-label)', textTransform: 'uppercase', textAlign: 'left' }}>Cliente Solicitante</th>}
                <th style={{ padding: 'var(--space-4)', color: 'var(--color-text-muted)', fontWeight: 600, fontSize: 'var(--text-label)', textTransform: 'uppercase', textAlign: 'left' }}>Capital Solicitado</th>
                <th style={{ padding: 'var(--space-4)', color: 'var(--color-text-muted)', fontWeight: 600, fontSize: 'var(--text-label)', textTransform: 'uppercase', textAlign: 'left' }}>Condiciones</th>
                <th style={{ padding: 'var(--space-4)', color: 'var(--color-text-muted)', fontWeight: 600, fontSize: 'var(--text-label)', textTransform: 'uppercase', textAlign: 'left' }}>Estado de Riesgo</th>
                {!isClient && <th style={{ padding: 'var(--space-4)', color: 'var(--color-text-muted)', fontWeight: 600, fontSize: 'var(--text-label)', textTransform: 'uppercase', textAlign: 'right' }}>Acciones Administrativas</th>}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [1,2,3,4].map(i => (
                  <tr key={i}>
                    <td colSpan={5} style={{ padding: '8px' }}><Skeleton height="60px" /></td>
                  </tr>
                ))
              ) : prestamos.length === 0 ? (
                <tr><td colSpan={5} style={{ textAlign: 'center', padding: 'var(--space-10)', color: 'var(--color-text-muted)' }}>No se han registrado solicitudes de crédito activas.</td></tr>
              ) : prestamos.map((p) => (
                <tr key={p.id} style={{ backgroundColor: 'rgba(255,255,255,0.02)' }} className="row-hover">
                  {!isClient && (
                    <td style={{ padding: 'var(--space-4)', borderRadius: 'var(--radius-md) 0 0 var(--radius-md)' }}>
                      <div style={{ fontWeight: 600, color: 'white' }}>{p.usuario?.nombre} {p.usuario?.apellido}</div>
                      <div className="font-mono" style={{ fontSize: '10px', color: 'var(--color-accent-500)', marginTop: '2px' }}>ID-REF: {p.id.toString().padStart(6, '0')}</div>
                    </td>
                  )}
                  <td style={{ padding: 'var(--space-4)', borderRadius: isClient ? 'var(--radius-md) 0 0 var(--radius-md)' : '0' }}>
                    <span className="text-amount" style={{ color: 'white' }}>${Number(p.monto).toLocaleString()}</span>
                  </td>
                  <td style={{ padding: 'var(--space-4)' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      <span style={{ fontSize: 'var(--text-body-sm)', color: 'var(--color-text-secondary)' }}>{p.plazoMeses} Meses</span>
                      <span style={{ fontSize: '11px', color: 'var(--color-accent-500)', fontWeight: 600 }}>{p.tasaInteres}% T.A.E.</span>
                    </div>
                  </td>
                  <td style={{ padding: 'var(--space-4)' }}>
                    <Badge status={p.estado} />
                  </td>
                  {!isClient && (
                    <td style={{ padding: 'var(--space-4)', borderRadius: '0 var(--radius-md) var(--radius-md) 0', textAlign: 'right' }}>
                      {p.estado === 'pendiente' ? (
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)' }}>
                          <Button 
                            variant="secondary" 
                            size="sm"
                            onClick={() => openApproval(p)}
                            style={{ border: '1px solid var(--color-success-500)', color: 'var(--color-success-500)' }}
                          >
                            <CheckCircle size={14} style={{ marginRight: '6px' }} /> Aprobar
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleStatus(p.id)}
                            style={{ color: 'var(--color-error-500)' }}
                          >
                            <XCircle size={14} style={{ marginRight: '6px' }} /> Rechazar
                          </Button>
                        </div>
                      ) : (
                        <span style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-caption)', textTransform: 'uppercase', letterSpacing: '1px' }}>Procesado</span>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(8px)' }}>
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={{ width: '100%', maxWidth: '520px' }}>
            <Card title="Nueva Solicitud de Crédito" subtitle="Análisis de viabilidad y asignación de fondos">
              <form onSubmit={handleRequest} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
                {!isClient && (
                  <div>
                    <label style={{ display: 'block', marginBottom: 'var(--space-2)', fontSize: 'var(--text-label)', color: 'var(--color-text-secondary)', fontWeight: 600 }}>Titular del Crédito</label>
                    <select 
                      required
                      style={{ 
                        width: '100%', 
                        backgroundColor: 'var(--color-primary-800)', 
                        border: 'var(--border-subtle)', 
                        borderRadius: 'var(--radius-md)', 
                        padding: 'var(--space-3) var(--space-4)',
                        color: 'white',
                        outline: 'none'
                      }}
                      value={newPrestamo.usuarioId}
                      onChange={(e) => setNewPrestamo({...newPrestamo, usuarioId: e.target.value})}
                    >
                      <option value="">Buscar cliente...</option>
                      {usuarios.map(u => <option key={u.id} value={u.id}>{u.nombre} {u.apellido}</option>)}
                    </select>
                  </div>
                )}

                <Input 
                  label="Capital de Inversión"
                  type="number"
                  required
                  min="100"
                  icon={<Landmark size={16} />}
                  value={newPrestamo.monto}
                  onChange={(e) => setNewPrestamo({...newPrestamo, monto: e.target.value})}
                />

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                  <Input 
                    label="Plazo (Meses)"
                    type="number"
                    required
                    min="1"
                    icon={<Clock size={16} />}
                    value={newPrestamo.plazoMeses}
                    onChange={(e) => setNewPrestamo({...newPrestamo, plazoMeses: e.target.value})}
                  />
                  <Input 
                    label="Tasa Pactada (%)"
                    type="number"
                    step="0.1"
                    required
                    min="0"
                    icon={<Calculator size={16} />}
                    value={newPrestamo.tasaInteres}
                    onChange={(e) => setNewPrestamo({...newPrestamo, tasaInteres: e.target.value})}
                  />
                </div>

                <div style={{ display: 'flex', gap: 'var(--space-4)', marginTop: 'var(--space-4)' }}>
                  <Button type="button" variant="ghost" fullWidth onClick={() => setShowModal(false)}>Cancelar</Button>
                  <Button type="submit" fullWidth>Emitir Solicitud</Button>
                </div>
              </form>
            </Card>
          </motion.div>
        </div>
      )}

      {showApprovalModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(8px)' }}>
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={{ width: '100%', maxWidth: '440px' }}>
            <Card title="Aprobación y Desembolso" subtitle={`Asignación de capital para: ${selectedPrestamo?.usuario?.nombre}`}>
              <div style={{ marginBottom: 'var(--space-6)', padding: 'var(--space-4)', backgroundColor: 'rgba(18, 183, 106, 0.05)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(18, 183, 106, 0.2)' }}>
                <p style={{ margin: 0, color: 'var(--color-success-500)', fontSize: 'var(--text-label)', fontWeight: 600 }}>Monto a Desembolsar</p>
                <h2 className="text-amount-lg amt-positive" style={{ margin: '4px 0 0 0' }}>${Number(selectedPrestamo?.monto).toLocaleString()}</h2>
              </div>
              
              <div style={{ marginBottom: 'var(--space-6)' }}>
                <label style={{ display: 'block', marginBottom: 'var(--space-2)', fontSize: 'var(--text-label)', color: 'var(--color-text-secondary)', fontWeight: 600 }}>Cuenta Destino (Liquidez)</label>
                <select 
                  required
                  style={{ 
                    width: '100%', 
                    backgroundColor: 'var(--color-primary-800)', 
                    border: 'var(--border-subtle)', 
                    borderRadius: 'var(--radius-md)', 
                    padding: 'var(--space-3) var(--space-4)',
                    color: 'white',
                    outline: 'none'
                  }}
                  value={selectedAccountId}
                  onChange={(e) => setSelectedAccountId(e.target.value)}
                >
                  {userAccounts.map(c => (
                    <option key={c.id} value={c.id}>{c.numeroCuenta} - ${Number(c.saldo).toLocaleString()}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', gap: 'var(--space-4)' }}>
                <Button type="button" variant="ghost" fullWidth onClick={() => setShowApprovalModal(false)}>Cancelar</Button>
                <Button onClick={handleApprove} variant="primary" fullWidth>Ejecutar Desembolso</Button>
              </div>
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

export default PrestamosPage;
