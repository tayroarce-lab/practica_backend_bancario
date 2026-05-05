import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeftRight, Send, Search, Filter, ArrowUpRight, ArrowDownLeft, Clock, FileDown } from 'lucide-react';
import { transaccionService, cuentaService } from '../services/api';
import type { Transaccion, Cuenta } from '../types';
import { exportToCSV, exportTransactionsToPDF } from '../utils/exportUtils';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Skeleton from '../components/ui/Skeleton';

const TransaccionesPage: React.FC = () => {
  const [transacciones, setTransacciones] = useState<Transaccion[]>([]);
  const [cuentas, setCuentas] = useState<Cuenta[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [newTransaccion, setNewTransaccion] = useState({
    cuentaOrigenId: '',
    cuentaDestinoId: '',
    monto: '',
    descripcion: ''
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
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await transaccionService.realizarTransferencia({
        cuentaOrigenId: Number(newTransaccion.cuentaOrigenId),
        cuentaDestinoId: Number(newTransaccion.cuentaDestinoId),
        monto: Number(newTransaccion.monto),
        descripcion: newTransaccion.descripcion
      });
      setShowModal(false);
      fetchData();
    } catch (error: any) {
      alert(error.message || 'Error al realizar transferencia');
    }
  };

  const filteredTxs = transacciones.filter(tx => 
    tx.descripcion?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tx.tipo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fade-in">
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-10)' }}>
        <div>
          <h1 className="h1" style={{ marginBottom: 'var(--space-2)' }}>Historial Operativo</h1>
          <p className="text-secondary">Auditoría completa de movimientos, transferencias y flujos de capital.</p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
          <Button variant="ghost" onClick={() => exportToCSV(transacciones, 'Transacciones_OldMoney')}>
            <FileDown size={18} style={{ marginRight: 'var(--space-2)' }} /> CSV
          </Button>
          <Button variant="ghost" onClick={() => exportTransactionsToPDF(transacciones)}>
            <FileDown size={18} style={{ marginRight: 'var(--space-2)' }} /> PDF
          </Button>
          <Button onClick={() => setShowModal(true)}>
            <Send size={18} style={{ marginRight: 'var(--space-2)' }} /> Nueva Transferencia
          </Button>
        </div>
      </header>

      <Card title="Movimientos Recientes" subtitle="Registro cronológico de actividad bancaria">
        <div style={{ marginBottom: 'var(--space-6)', display: 'flex', gap: 'var(--space-4)' }}>
          <div style={{ flex: 1 }}>
            <Input 
              placeholder="Buscar por descripción u operación..." 
              icon={<Search size={18} />}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button variant="secondary">
            <Filter size={18} style={{ marginRight: 'var(--space-2)' }} /> Filtros
          </Button>
        </div>

        <div className="table-container">
          <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 8px' }}>
            <thead>
              <tr>
                <th style={{ padding: 'var(--space-4)', color: 'var(--color-text-muted)', fontWeight: 600, fontSize: 'var(--text-label)', textTransform: 'uppercase', textAlign: 'left' }}>Fecha y Hora</th>
                <th style={{ padding: 'var(--space-4)', color: 'var(--color-text-muted)', fontWeight: 600, fontSize: 'var(--text-label)', textTransform: 'uppercase', textAlign: 'left' }}>Operación</th>
                <th style={{ padding: 'var(--space-4)', color: 'var(--color-text-muted)', fontWeight: 600, fontSize: 'var(--text-label)', textTransform: 'uppercase', textAlign: 'left' }}>Descripción</th>
                <th style={{ padding: 'var(--space-4)', color: 'var(--color-text-muted)', fontWeight: 600, fontSize: 'var(--text-label)', textTransform: 'uppercase', textAlign: 'right' }}>Monto</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [1,2,3,4,5].map(i => (
                  <tr key={i}>
                    <td colSpan={4} style={{ padding: '8px' }}>
                      <Skeleton height="48px" />
                    </td>
                  </tr>
                ))
              ) : filteredTxs.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ textAlign: 'center', padding: 'var(--space-10)', color: 'var(--color-text-muted)' }}>
                    No se han encontrado registros coincidentes.
                  </td>
                </tr>
              ) : filteredTxs.map((tx) => (
                <tr key={tx.id} style={{ backgroundColor: 'rgba(255,255,255,0.02)' }} className="row-hover">
                  <td style={{ padding: 'var(--space-4)', borderRadius: 'var(--radius-md) 0 0 var(--radius-md)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                      <Clock size={14} color="var(--color-accent-500)" />
                      <span style={{ fontSize: 'var(--text-body-sm)', color: 'white' }}>{new Date(tx.createdAt).toLocaleString()}</span>
                    </div>
                  </td>
                  <td style={{ padding: 'var(--space-4)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                      <div style={{ 
                        padding: '4px', 
                        borderRadius: '4px', 
                        backgroundColor: tx.tipo === 'deposito' ? 'rgba(18, 183, 106, 0.1)' : tx.tipo === 'retiro' ? 'rgba(240, 68, 56, 0.1)' : 'rgba(201, 168, 76, 0.1)',
                        color: tx.tipo === 'deposito' ? 'var(--color-success-500)' : tx.tipo === 'retiro' ? 'var(--color-error-500)' : 'var(--color-accent-500)'
                      }}>
                        {tx.tipo === 'deposito' ? <ArrowDownLeft size={14} /> : tx.tipo === 'retiro' ? <ArrowUpRight size={14} /> : <ArrowLeftRight size={14} />}
                      </div>
                      <span style={{ textTransform: 'capitalize', fontWeight: 600, fontSize: 'var(--text-body-sm)' }}>{tx.tipo}</span>
                    </div>
                  </td>
                  <td style={{ padding: 'var(--space-4)', color: 'var(--color-text-secondary)', fontSize: 'var(--text-body-sm)' }}>
                    {tx.descripcion || 'Sin descripción adicional'}
                  </td>
                  <td style={{ padding: 'var(--space-4)', borderRadius: '0 var(--radius-md) var(--radius-md) 0', textAlign: 'right' }}>
                    <span className={`text-amount ${tx.tipo === 'deposito' ? 'amt-positive' : tx.tipo === 'retiro' ? 'amt-negative' : 'amt-neutral'}`}>
                      {tx.tipo === 'deposito' ? '+' : tx.tipo === 'retiro' ? '-' : '↔'}${Number(tx.monto).toLocaleString()}
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
            <Card title="Nueva Transferencia" subtitle="Emisión de orden de pago interbancaria">
              <form onSubmit={handleTransfer} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: 'var(--space-2)', fontSize: 'var(--text-label)', color: 'var(--color-text-secondary)', fontWeight: 600 }}>Cuenta de Origen</label>
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
                    value={newTransaccion.cuentaOrigenId}
                    onChange={(e) => setNewTransaccion({...newTransaccion, cuentaOrigenId: e.target.value})}
                  >
                    <option value="">Seleccionar cuenta...</option>
                    {cuentas.map(c => <option key={c.id} value={c.id}>{c.numeroCuenta} - ${Number(c.saldo).toLocaleString()}</option>)}
                  </select>
                </div>

                <Input 
                  label="Cuenta de Destino (No. Cuenta)"
                  placeholder="Ingrese el número de cuenta destino"
                  required
                  value={newTransaccion.cuentaDestinoId}
                  onChange={(e) => setNewTransaccion({...newTransaccion, cuentaDestinoId: e.target.value})}
                />

                <Input 
                  label="Monto a Transferir"
                  type="number"
                  required
                  min="1"
                  value={newTransaccion.monto}
                  onChange={(e) => setNewTransaccion({...newTransaccion, monto: e.target.value})}
                />

                <Input 
                  label="Concepto / Descripción"
                  placeholder="Ej: Pago de servicios"
                  value={newTransaccion.descripcion}
                  onChange={(e) => setNewTransaccion({...newTransaccion, descripcion: e.target.value})}
                />

                <div style={{ display: 'flex', gap: 'var(--space-4)', marginTop: 'var(--space-4)' }}>
                  <Button type="button" variant="ghost" fullWidth onClick={() => setShowModal(false)}>Cancelar</Button>
                  <Button type="submit" fullWidth>Ejecutar Transferencia</Button>
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
