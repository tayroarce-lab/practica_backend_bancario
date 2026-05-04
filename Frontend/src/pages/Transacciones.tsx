import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeftRight, Send, Search, Filter, ArrowUpRight, ArrowDownLeft, Clock } from 'lucide-react';
import { transaccionService, cuentaService } from '../services/api';
import type { Transaccion, Cuenta } from '../types';

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
      case 'deposito': return 'var(--success)';
      case 'retiro': return 'var(--error)';
      case 'transferencia': return 'var(--accent)';
      default: return 'var(--text)';
    }
  };

  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case 'deposito': return <ArrowDownLeft size={16} />;
      case 'retiro': return <ArrowUpRight size={16} />;
      case 'transferencia': return <ArrowLeftRight size={16} />;
      default: return <Clock size={16} />;
    }
  };

  return (
    <div className="fade-in">
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
        <div>
          <h1 style={{ fontSize: '2.25rem', marginBottom: '0.5rem' }}>Historial de Transacciones</h1>
          <p style={{ color: 'var(--text-muted)' }}>Registro de todos los movimientos y transferencias bancarias.</p>
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
          <Send size={20} /> Nueva Transferencia
        </button>
      </header>

      <div className="glass" style={{ borderRadius: 'var(--radius)', overflow: 'hidden' }}>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ position: 'relative', width: '300px' }}>
            <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input type="text" placeholder="Filtrar por ID..." style={{ width: '100%', paddingLeft: '3rem' }} />
          </div>
          <button style={{ backgroundColor: 'var(--primary-light)', padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', border: '1px solid var(--border)' }}>
            <Filter size={18} /> Filtros
          </button>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ backgroundColor: 'rgba(255,255,255,0.03)' }}>
              <th style={{ padding: '1.25rem 1.5rem', color: 'var(--text-muted)', fontWeight: 600 }}>Fecha</th>
              <th style={{ padding: '1.25rem 1.5rem', color: 'var(--text-muted)', fontWeight: 600 }}>Tipo</th>
              <th style={{ padding: '1.25rem 1.5rem', color: 'var(--text-muted)', fontWeight: 600 }}>Monto</th>
              <th style={{ padding: '1.25rem 1.5rem', color: 'var(--text-muted)', fontWeight: 600 }}>Cuenta</th>
              <th style={{ padding: '1.25rem 1.5rem', color: 'var(--text-muted)', fontWeight: 600 }}>ID Transacción</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} style={{ textAlign: 'center', padding: '3rem' }}>Cargando transacciones...</td></tr>
            ) : transacciones.length === 0 ? (
              <tr><td colSpan={5} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>Sin movimientos.</td></tr>
            ) : transacciones.map((tx) => (
              <tr key={tx.id} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '1.25rem 1.5rem', fontSize: '0.875rem' }}>
                  {new Date(tx.createdAt).toLocaleString()}
                </td>
                <td style={{ padding: '1.25rem 1.5rem' }}>
                  <div style={{ 
                    display: 'inline-flex', 
                    alignItems: 'center', 
                    gap: '0.5rem', 
                    color: getTipoColor(tx.tipo),
                    backgroundColor: `${getTipoColor(tx.tipo)}15`,
                    padding: '0.25rem 0.75rem',
                    borderRadius: '20px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    textTransform: 'uppercase'
                  }}>
                    {getTipoIcon(tx.tipo)}
                    {tx.tipo}
                  </div>
                </td>
                <td style={{ padding: '1.25rem 1.5rem', fontWeight: 700, fontSize: '1.125rem' }}>
                  {tx.tipo === 'retiro' || (tx.tipo === 'transferencia' && tx.cuentaDestinoId) ? '-' : '+'}${Number(tx.monto).toLocaleString()}
                </td>
                <td style={{ padding: '1.25rem 1.5rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                  Cuenta ID: {tx.cuentaOrigenId || tx.cuentaDestinoId}
                  {tx.cuentaDestinoId && tx.cuentaOrigenId && <span> → ID: {tx.cuentaDestinoId}</span>}
                </td>
                <td style={{ padding: '1.25rem 1.5rem', fontFamily: 'monospace', color: 'var(--text-muted)' }}>
                  TXN-{tx.id.toString().padStart(6, '0')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' }}>
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="glass" style={{ padding: '2.5rem', borderRadius: 'var(--radius)', width: '100%', maxWidth: '500px' }}>
            <h2 style={{ marginBottom: '1.5rem' }}>Nueva Transferencia</h2>
            <form onSubmit={handleTransfer} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontSize: '0.875rem', fontWeight: 600 }}>Cuenta de Origen</label>
                <select 
                  required
                  style={{ width: '100%' }}
                  value={newTransfer.cuentaOrigenId}
                  onChange={(e) => setNewTransfer({...newTransfer, cuentaOrigenId: e.target.value})}
                >
                  <option value="">Seleccione cuenta</option>
                  {cuentas.filter(c => c.estado === 'activa').map(c => (
                    <option key={c.id} value={c.id}>{c.numeroCuenta} (${Number(c.saldo).toLocaleString()}) - {c.usuario?.nombre}</option>
                  ))}
                </select>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontSize: '0.875rem', fontWeight: 600 }}>Cuenta de Destino</label>
                <select 
                  required
                  style={{ width: '100%' }}
                  value={newTransfer.cuentaDestinoId}
                  onChange={(e) => setNewTransfer({...newTransfer, cuentaDestinoId: e.target.value})}
                >
                  <option value="">Seleccione cuenta destino</option>
                  {cuentas.filter(c => c.id.toString() !== newTransfer.cuentaOrigenId).map(c => (
                    <option key={c.id} value={c.id}>{c.numeroCuenta} - {c.usuario?.nombre}</option>
                  ))}
                </select>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontSize: '0.875rem', fontWeight: 600 }}>Monto a Transferir</label>
                <input 
                  type="number"
                  required
                  min="1"
                  style={{ width: '100%' }}
                  value={newTransfer.monto}
                  onChange={(e) => setNewTransfer({...newTransfer, monto: e.target.value})}
                />
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ flex: 1, padding: '0.75rem', backgroundColor: 'var(--primary-light)', border: '1px solid var(--border)', color: 'var(--text)' }}>Cancelar</button>
                <button type="submit" style={{ flex: 1, padding: '0.75rem', backgroundColor: 'var(--accent)', color: 'white' }}>Realizar Transferencia</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default TransaccionesPage;
