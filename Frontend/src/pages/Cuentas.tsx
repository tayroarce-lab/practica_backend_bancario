import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, Plus, ArrowUpRight, ArrowDownLeft, Lock, Unlock } from 'lucide-react';
import { toast } from 'sonner';
import { cuentaService, usuarioService } from '../services/api';
import type { Cuenta, Usuario } from '../types';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Badge from '../components/ui/Badge';

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
      toast.success('Cuenta creada exitosamente');
      fetchData();
    } catch (error: any) {
      // handled by interceptor
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
      toast.success('Operación realizada con éxito');
      fetchData();
    } catch (error) {
      // handled by interceptor
    }
  };

  const toggleEstado = async (cuenta: Cuenta) => {
    try {
      const nuevoEstado = cuenta.estado === 'activa' ? 'bloqueada' : 'activa';
      await cuentaService.actualizarEstado(cuenta.id, nuevoEstado);
      toast.info(`Cuenta ${nuevoEstado === 'activa' ? 'activada' : 'bloqueada'}`);
      fetchData();
    } catch (error) {
      // handled by interceptor
    }
  };

  return (
    <div className="fade-in">
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-10)' }}>
        <div>
          <h1 className="h1" style={{ marginBottom: 'var(--space-2)' }}>Gestión de Cuentas</h1>
          <p className="text-secondary">Control de saldos, estados y productos financieros.</p>
        </div>
        <Button onClick={() => setShowModal(true)}>
          <Plus size={18} style={{ marginRight: 'var(--space-2)' }} /> Nueva Cuenta
        </Button>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 'var(--space-6)' }}>
        {loading ? (
          <p className="text-muted">Procesando información de cuentas...</p>
        ) : cuentas.map((cuenta) => (
          <Card
            key={cuenta.id}
            action={<Badge status={cuenta.estado} />}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
              <div style={{ 
                width: '48px', 
                height: '48px', 
                borderRadius: 'var(--radius-md)', 
                backgroundColor: 'var(--color-bg-subtle)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                color: 'var(--color-accent-500)',
                border: 'var(--border-subtle)'
              }}>
                <CreditCard size={24} />
              </div>
              <div>
                <p className="text-muted" style={{ fontSize: 'var(--text-label)', fontWeight: 600, textTransform: 'uppercase' }}>{cuenta.tipoCuenta?.nombre || 'Cuenta Corriente'}</p>
                <h3 className="font-mono" style={{ fontSize: '1rem', color: 'white', margin: 0 }}>{cuenta.numeroCuenta}</h3>
              </div>
            </div>

            <div style={{ marginBottom: 'var(--space-8)' }}>
              <p className="text-muted" style={{ fontSize: 'var(--text-label)' }}>Saldo Disponible</p>
              <h2 className="text-amount-lg amt-positive" style={{ margin: 'var(--space-1) 0' }}>
                ${Number(cuenta.saldo).toLocaleString()}
              </h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginTop: 'var(--space-2)' }}>
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--color-accent-500)' }}></div>
                <p className="text-secondary" style={{ fontSize: 'var(--text-body-sm)' }}>Titular: {cuenta.usuario?.nombre} {cuenta.usuario?.apellido}</p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-2)' }}>
              <Button 
                variant="ghost"
                size="sm"
                disabled={cuenta.estado === 'bloqueada'}
                onClick={() => { setSelectedCuenta(cuenta); setShowActionModal('deposito'); }}
                style={{ flexDirection: 'column', height: 'auto', padding: 'var(--space-3) 0' }}
              >
                <ArrowDownLeft size={16} /> <span style={{ marginTop: '4px' }}>Depósito</span>
              </Button>
              <Button 
                variant="ghost"
                size="sm"
                disabled={cuenta.estado === 'bloqueada'}
                onClick={() => { setSelectedCuenta(cuenta); setShowActionModal('retiro'); }}
                style={{ flexDirection: 'column', height: 'auto', padding: 'var(--space-3) 0' }}
              >
                <ArrowUpRight size={16} /> <span style={{ marginTop: '4px' }}>Retiro</span>
              </Button>
              <Button 
                variant="ghost"
                size="sm"
                onClick={() => toggleEstado(cuenta)}
                style={{ flexDirection: 'column', height: 'auto', padding: 'var(--space-3) 0' }}
              >
                {cuenta.estado === 'activa' ? <Lock size={16} /> : <Unlock size={16} />} 
                <span style={{ marginTop: '4px' }}>{cuenta.estado === 'activa' ? 'Bloquear' : 'Activar'}</span>
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Modal Crear Cuenta */}
      {showModal && (
        <div className="modal-overlay" style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(8px)' }}>
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={{ width: '100%', maxWidth: '480px' }}>
            <Card title="Apertura de Cuenta" subtitle="Complete los datos para el nuevo producto bancario">
              <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ marginBottom: 'var(--space-5)' }}>
                  <label style={{ display: 'block', marginBottom: 'var(--space-2)', fontSize: 'var(--text-label)', color: 'var(--color-text-secondary)', fontWeight: 600 }}>Seleccionar Cliente</label>
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
                    value={newCuenta.usuarioId}
                    onChange={(e) => setNewCuenta({...newCuenta, usuarioId: e.target.value})}
                  >
                    <option value="">Buscar cliente...</option>
                    {usuarios.map(u => <option key={u.id} value={u.id}>{u.nombre} {u.apellido}</option>)}
                  </select>
                </div>
                
                <div style={{ marginBottom: 'var(--space-5)' }}>
                  <label style={{ display: 'block', marginBottom: 'var(--space-2)', fontSize: 'var(--text-label)', color: 'var(--color-text-secondary)', fontWeight: 600 }}>Tipo de Producto</label>
                  <select 
                    style={{ 
                      width: '100%', 
                      backgroundColor: 'var(--color-primary-800)', 
                      border: 'var(--border-subtle)', 
                      borderRadius: 'var(--radius-md)', 
                      padding: 'var(--space-3) var(--space-4)',
                      color: 'white',
                      outline: 'none'
                    }}
                    value={newCuenta.tipoCuentaId}
                    onChange={(e) => setNewCuenta({...newCuenta, tipoCuentaId: e.target.value})}
                  >
                    <option value="1">Cuenta de Ahorros Premium</option>
                    <option value="2">Cuenta Corriente Business</option>
                    <option value="3">Cuenta Nómina Gold</option>
                  </select>
                </div>

                <Input 
                  label="Capital Inicial"
                  type="number"
                  min="0"
                  value={newCuenta.saldoInicial}
                  onChange={(e) => setNewCuenta({...newCuenta, saldoInicial: e.target.value})}
                />

                <div style={{ display: 'flex', gap: 'var(--space-4)', marginTop: 'var(--space-4)' }}>
                  <Button type="button" variant="ghost" fullWidth onClick={() => setShowModal(false)}>Cancelar</Button>
                  <Button type="submit" fullWidth>Confirmar Apertura</Button>
                </div>
              </form>
            </Card>
          </motion.div>
        </div>
      )}

      {/* Modal Operaciones */}
      {showActionModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(8px)' }}>
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={{ width: '100%', maxWidth: '400px' }}>
            <Card title={showActionModal === 'deposito' ? 'Ingreso de Capital' : 'Retiro de Fondos'} subtitle={`Cuenta No: ${selectedCuenta?.numeroCuenta}`}>
              <form onSubmit={handleAction}>
                <Input 
                  label="Monto de Operación"
                  type="number"
                  required
                  min="1"
                  autoFocus
                  style={{ fontSize: '1.5rem', textAlign: 'center', fontFamily: 'var(--font-mono)' }}
                  value={monto}
                  onChange={(e) => setMonto(e.target.value)}
                />
                <div style={{ display: 'flex', gap: 'var(--space-4)', marginTop: 'var(--space-6)' }}>
                  <Button type="button" variant="ghost" fullWidth onClick={() => setShowActionModal(null)}>Cerrar</Button>
                  <Button type="submit" variant={showActionModal === 'deposito' ? 'primary' : 'danger'} fullWidth>
                    {showActionModal === 'deposito' ? 'Ejecutar Depósito' : 'Confirmar Retiro'}
                  </Button>
                </div>
              </form>
            </Card>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default CuentasPage;
