import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeftRight, Send, Search, Filter, ArrowUpRight, ArrowDownLeft, Clock } from 'lucide-react';
import { transaccionService, cuentaService } from '../services/api';
import type { Transaccion, Cuenta } from '../types';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';

const TransaccionesPage: React.FC = () => {
  const [transacciones, setTransacciones] = useState<Transaccion[]>([]);
  const [cuentas, setCuentas] = useState<Cuenta[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newTransfer, setNewTransfer] = useState({ 
    cuentaOrigenId: '', 
    cuentaDestinoId: '', 
    monto: '' 
  });

  const fetchData = async () => {
    try {
      const [resTxs, resCuentas] = await Promise.all([
        transaccionService.getTransacciones(),
        cuentaService.getCuentas()
      ]);
      setTransacciones(resTxs.data);
      setCuentas(resCuentas.data);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newTransfer.cuentaOrigenId === newTransfer.cuentaDestinoId) {
      return alert('La cuenta de origen y destino no pueden ser la misma.');
    }
    try {
      await transaccionService.realizarTransferencia({
        cuentaOrigenId: Number(newTransfer.cuentaOrigenId),
        cuentaDestinoId: Number(newTransfer.cuentaDestinoId),
        monto: Number(newTransfer.monto)
      });
      setShowModal(false);
      setNewTransfer({ cuentaOrigenId: '', cuentaDestinoId: '', monto: '' });
      fetchData();
    } catch (error: any) {
      alert(error.message || 'Error al realizar transferencia');
    }
  };

  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case 'deposito': return 'var(--color-success-500)';
      case 'retiro': return 'var(--color-error-500)';
      case 'transferencia': return 'var(--color-accent-500)';
      default: return 'var(--color-text-primary)';
    }
  };

  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case 'deposito': return <ArrowDownLeft size={14} />;
      case 'retiro': return <ArrowUpRight size={14} />;
      case 'transferencia': return <ArrowLeftRight size={14} />;
      default: return <Clock size={14} />;
    }
  };

  return (
    <div className="fade-in">
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-10)' }}>
        <div>
          <h1 className="h1" style={{ marginBottom: 'var(--space-2)' }}>Historial Operativo</h1>
          <p className="text-secondary">Auditoría completa de movimientos, transferencias y flujos de capital.</p>
        </div>
        <Button onClick={() => setShowModal(true)}>
          <Send size={18} style={{ marginRight: 'var(--space-2)' }} /> Nueva Transferencia
        </Button>
      </header>

      <Card title="Movimientos Recientes" subtitle="Registro cronológico de actividad bancaria">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-6)', gap: 'var(--space-4)' }}>
          <div style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
            <Search size={18} style={{ position: 'absolute', left: 'var(--space-4)', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
            <input 
              type="text" 
              placeholder="Buscar transacción por ID..." 
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
          <Button variant="secondary" size="sm">
            <Filter size={16} style={{ marginRight: 'var(--space-2)' }} /> Filtros Avanzados
          </Button>
        </div>

        <div className="table-container">
          <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 8px' }}>
            <thead>
              <tr>
                <th style={{ padding: 'var(--space-4)', color: 'var(--color-text-muted)', fontWeight: 600, fontSize: 'var(--text-label)', textTransform: 'uppercase', textAlign: 'left' }}>Fecha y Hora</th>
                <th style={{ padding: 'var(--space-4)', color: 'var(--color-text-muted)', fontWeight: 600, fontSize: 'var(--text-label)', textTransform: 'uppercase', textAlign: 'left' }}>Naturaleza</th>
                <th style={{ padding: 'var(--space-4)', color: 'var(--color-text-muted)', fontWeight: 600, fontSize: 'var(--text-label)', textTransform: 'uppercase', textAlign: 'left' }}>Importe</th>
                <th style={{ padding: 'var(--space-4)', color: 'var(--color-text-muted)', fontWeight: 600, fontSize: 'var(--text-label)', textTransform: 'uppercase', textAlign: 'left' }}>Referencia de Cuenta</th>
                <th style={{ padding: 'var(--space-4)', color: 'var(--color-text-muted)', fontWeight: 600, fontSize: 'var(--text-label)', textTransform: 'uppercase', textAlign: 'right' }}>Auditoría ID</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} style={{ textAlign: 'center', padding: 'var(--space-10)', color: 'var(--color-text-muted)' }}>Analizando registros...</td></tr>
              ) : transacciones.length === 0 ? (
                <tr><td colSpan={5} style={{ textAlign: 'center', padding: 'var(--space-10)', color: 'var(--color-text-muted)' }}>No se han encontrado registros de movimientos.</td></tr>
              ) : transacciones.map((tx) => (
                <tr key={tx.id} style={{ backgroundColor: 'rgba(255,255,255,0.02)', transition: 'background 0.3s ease' }} className="row-hover">
                  <td style={{ padding: 'var(--space-4)', borderRadius: 'var(--radius-md) 0 0 var(--radius-md)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                      <Clock size={14} color="var(--color-accent-500)" />
                      <span style={{ fontSize: 'var(--text-body-sm)', color: 'white' }}>{new Date(tx.createdAt).toLocaleString()}</span>
                    </div>
                  </td>
                  <td style={{ padding: 'var(--space-4)' }}>
                    <div style={{ 
                      display: 'inline-flex', 
                      alignItems: 'center', 
                      gap: 'var(--space-2)', 
                      color: getTipoColor(tx.tipo),
                      backgroundColor: `${getTipoColor(tx.tipo)}10`,
                      padding: '4px 12px',
                      borderRadius: 'var(--radius-full)',
                      fontSize: '10px',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      border: `1px solid ${getTipoColor(tx.tipo)}30`
                    }}>
                      {getTipoIcon(tx.tipo)}
                      {tx.tipo}
                    </div>
                  </td>
                  <td style={{ padding: 'var(--space-4)' }}>
                    <span className={`text-amount ${tx.tipo === 'deposito' ? 'amt-positive' : tx.tipo === 'retiro' ? 'amt-negative' : 'amt-neutral'}`}>
                      {tx.tipo === 'retiro' || (tx.tipo === 'transferencia' && tx.cuentaDestinoId) ? '-' : '+'}${Number(tx.monto).toLocaleString()}
                    </span>
                  </td>
                  <td style={{ padding: 'var(--space-4)' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      <span className="text-account">ID: {tx.cuentaOrigenId || tx.cuentaDestinoId}</span>
                      {tx.cuentaDestinoId && tx.cuentaOrigenId && (
                        <span style={{ fontSize: '10px', color: 'var(--color-accent-500)' }}>Ruta: {tx.cuentaOrigenId} → {tx.cuentaDestinoId}</span>
                      )}
                    </div>
                  </td>
                  <td style={{ padding: 'var(--space-4)', borderRadius: '0 var(--radius-md) var(--radius-md) 0', textAlign: 'right' }}>
                    <span className="font-mono" style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-caption)' }}>
                      TRX-{tx.id.toString().padStart(6, '0')}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(8px)' }}>
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={{ width: '100%', maxWidth: '500px' }}>
            <Card title="Ejecutar Transferencia" subtitle="Movimiento de capital entre cuentas internas">
              <form onSubmit={handleTransfer} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: 'var(--space-2)', fontSize: 'var(--text-label)', color: 'var(--color-text-secondary)', fontWeight: 600 }}>Origen de Fondos</label>
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
                    value={newTransfer.cuentaOrigenId}
                    onChange={(e) => setNewTransfer({...newTransfer, cuentaOrigenId: e.target.value})}
                  >
                    <option value="">Seleccione cuenta emisora</option>
                    {cuentas.filter(c => c.estado === 'activa').map(c => (
                      <option key={c.id} value={c.id}>{c.numeroCuenta} (${Number(c.saldo).toLocaleString()}) - {c.usuario?.nombre}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: 'var(--space-2)', fontSize: 'var(--text-label)', color: 'var(--color-text-secondary)', fontWeight: 600 }}>Destino de Fondos</label>
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
                    value={newTransfer.cuentaDestinoId}
                    onChange={(e) => setNewTransfer({...newTransfer, cuentaDestinoId: e.target.value})}
                  >
                    <option value="">Seleccione cuenta receptora</option>
                    {cuentas.filter(c => c.id.toString() !== newTransfer.cuentaOrigenId).map(c => (
                      <option key={c.id} value={c.id}>{c.numeroCuenta} - {c.usuario?.nombre}</option>
                    ))}
                  </select>
                </div>

                <Input 
                  label="Monto a Transferir"
                  type="number"
                  required
                  min="1"
                  placeholder="0.00"
                  value={newTransfer.monto}
                  onChange={(e) => setNewTransfer({...newTransfer, monto: e.target.value})}
                />

                <div style={{ display: 'flex', gap: 'var(--space-4)', marginTop: 'var(--space-4)' }}>
                  <Button type="button" variant="ghost" fullWidth onClick={() => setShowModal(false)}>Cancelar</Button>
                  <Button type="submit" fullWidth>Confirmar Envío</Button>
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

export default TransaccionesPage;
