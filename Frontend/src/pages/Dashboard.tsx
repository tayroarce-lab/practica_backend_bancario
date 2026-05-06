import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Landmark, 
  UserCircle, 
  Wallet, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Send, 
  UserPlus,
  ShieldCheck,
  TrendingUp,
  ArrowLeftRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { usuarioService, cuentaService, transaccionService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import type { Transaccion } from '../types';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Skeleton from '../components/ui/Skeleton';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    usuarios: 0,
    cuentas: 0,
    saldoTotal: 0,
    transaccionesHoy: 0
  });
  const [recentTxs, setRecentTxs] = useState<Transaccion[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    const fetchStats = async () => {
      if (!user) return;
      
      try {
        if (user.rol === 'admin' || user.rol === 'empleado') {
          // Vista Administrativa
          const [users, accounts, txs] = await Promise.all([
            usuarioService.getUsuarios(),
            cuentaService.getCuentas(),
            transaccionService.getTransacciones()
          ]);

          const totalBalance = accounts.data.reduce((acc, curr) => acc + Number(curr.saldo), 0);
          
          setStats({
            usuarios: users.data.length,
            cuentas: accounts.data.length,
            saldoTotal: totalBalance,
            transaccionesHoy: txs.data.length
          });

          setRecentTxs(txs.data.slice(0, 5));
          processChartData(txs.data);
        } else {
          // Vista Cliente
          const resCuentas = await cuentaService.getCuentasPorUsuario(user.id);
          const cuentas = resCuentas.data;
          
          // Obtener transacciones de todas sus cuentas
          const txPromises = cuentas.map(c => transaccionService.getTransaccionesPorCuenta(c.id));
          const txResponses = await Promise.all(txPromises);
          const allTxs = txResponses.flatMap(r => r.data).sort((a, b) => 
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );

          const userBalance = cuentas.reduce((acc, curr) => acc + Number(curr.saldo), 0);

          setStats({
            usuarios: 1, // El mismo
            cuentas: cuentas.length,
            saldoTotal: userBalance,
            transaccionesHoy: allTxs.filter(t => 
              new Date(t.createdAt).toDateString() === new Date().toDateString()
            ).length
          });

          setRecentTxs(allTxs.slice(0, 5));
          processChartData(allTxs);
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    const processChartData = (txs: Transaccion[]) => {
      const dailyData = txs.reduce((acc: any, tx: Transaccion) => {
        const date = new Date(tx.createdAt).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });
        acc[date] = (acc[date] || 0) + Number(tx.monto);
        return acc;
      }, {});

      const formattedChartData = Object.entries(dailyData).map(([name, total]) => ({ name, total }));
      setChartData(formattedChartData.length > 0 ? formattedChartData : [{ name: 'Sin datos', total: 0 }]);
    };

    fetchStats();
  }, [user]);

  const statItems = [
    { label: user?.rol === 'cliente' ? 'Perfil Activo' : 'Total Clientes', value: user?.rol === 'cliente' ? 1 : stats.usuarios, icon: <UserCircle size={24} />, color: 'var(--color-primary-500)' },
    { label: 'Cuentas Propias', value: stats.cuentas, icon: <Wallet size={24} />, color: 'var(--color-success-500)' },
    { label: user?.rol === 'cliente' ? 'Mi Saldo Total' : 'Patrimonio Total', value: `$${stats.saldoTotal.toLocaleString()}`, icon: <Landmark size={24} />, color: 'var(--color-accent-500)' },
    { label: 'Operaciones Hoy', value: stats.transaccionesHoy, icon: <TrendingUp size={24} />, color: 'var(--color-info-500)' },
  ];

  return (
    <div className="fade-in">
      <header style={{ marginBottom: 'var(--space-10)' }}>
        <h1 className="h1" style={{ marginBottom: 'var(--space-2)' }}>Panel General</h1>
        <p className="text-secondary">
          {user?.rol === 'cliente' 
            ? `Bienvenido, ${user.nombre}. Resumen de su patrimonio personal.`
            : 'Gestión integral de patrimonio y operaciones bancarias.'}
        </p>
      </header>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', 
        gap: 'var(--space-6)',
        marginBottom: 'var(--space-10)'
      }}>
        {statItems.map((item, index) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="card"
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--space-4)'
            }}
          >
            <div style={{ 
              backgroundColor: `${item.color}15`, 
              color: item.color,
              width: '52px',
              height: '52px',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: `1px solid ${item.color}30`
            }}>
              {item.icon}
            </div>
            <div>
              <p className="text-muted" style={{ fontSize: 'var(--text-label)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' }}>{item.label}</p>
              {loading ? (
                <Skeleton width="60%" height="2rem" style={{ marginTop: 'var(--space-1)' }} />
              ) : (
                <h3 className={item.label.includes('Saldo') || item.label.includes('Patrimonio') ? 'text-amount-lg text-gold' : 'h2'} style={{ marginTop: 'var(--space-1)' }}>{item.value}</h3>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '1fr',
        gap: 'var(--space-6)' 
      }} className="dashboard-grid">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
          <Card 
            title="Flujo de Capital" 
            subtitle="Análisis de movimientos en tiempo real"
          >
            <div style={{ height: '320px', width: '100%' }}>
              {loading || !isMounted ? (
                <Skeleton height="100%" />
              ) : (
                <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0} debounce={100}>
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--color-accent-500)" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="var(--color-accent-500)" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(201,168,76,0.1)" />
                    <XAxis dataKey="name" stroke="var(--color-text-muted)" fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis stroke="var(--color-text-muted)" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v}`} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'var(--color-bg-surface)', border: 'var(--border-subtle)', borderRadius: 'var(--radius-md)' }}
                      itemStyle={{ color: 'var(--color-accent-500)', fontWeight: 600 }}
                      labelStyle={{ color: 'white', marginBottom: '4px' }}
                    />
                    <Area type="monotone" dataKey="total" stroke="var(--color-accent-500)" strokeWidth={3} fillOpacity={1} fill="url(#colorTotal)" />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </Card>

          <Card title="Actividad Reciente" subtitle="Últimas transacciones registradas">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              {loading ? (
                [1,2,3].map(i => <Skeleton key={i} height="70px" />)
              ) : recentTxs.length > 0 ? recentTxs.map(tx => (
                <div key={tx.id} style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  padding: 'var(--space-4)', 
                  backgroundColor: 'rgba(255,255,255,0.02)', 
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid rgba(255,255,255,0.03)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
                    <div style={{ 
                      padding: 'var(--space-3)', 
                      backgroundColor: tx.tipo === 'deposito' ? 'rgba(18, 183, 106, 0.1)' : tx.tipo === 'retiro' ? 'rgba(240, 68, 56, 0.1)' : 'rgba(201, 168, 76, 0.1)', 
                      borderRadius: 'var(--radius-md)', 
                      color: tx.tipo === 'deposito' ? 'var(--color-success-500)' : tx.tipo === 'retiro' ? 'var(--color-error-500)' : 'var(--color-accent-500)'
                    }}>
                      {tx.tipo === 'deposito' ? <ArrowDownLeft size={18} /> : tx.tipo === 'retiro' ? <ArrowUpRight size={18} /> : <ArrowLeftRight size={18} />}
                    </div>
                    <div>
                      <p className="font-display" style={{ fontWeight: 600, fontSize: 'var(--text-body)', textTransform: 'capitalize', color: 'white' }}>{tx.tipo}</p>
                      <p style={{ fontSize: 'var(--text-caption)', color: 'var(--color-text-muted)' }}>{new Date(tx.createdAt).toLocaleString()}</p>
                    </div>
                  </div>
                  <p className={`text-amount ${tx.tipo === 'deposito' ? 'amt-positive' : tx.tipo === 'retiro' ? 'amt-negative' : 'amt-neutral'}`}>
                    {tx.tipo === 'deposito' ? '+' : tx.tipo === 'retiro' ? '-' : '↔'}${Number(tx.monto).toLocaleString()}
                  </p>
                </div>
              )) : (
                <p className="text-muted" style={{ textAlign: 'center', padding: 'var(--space-4)' }}>No hay transacciones recientes.</p>
              )}
            </div>
          </Card>
        </div>

        <Card title="Operaciones Rápidas" subtitle="Acciones de gestión directa">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <Button 
              onClick={() => navigate('/transacciones')}
              fullWidth
            >
              <Send size={18} style={{ marginRight: 'var(--space-3)' }} /> Nueva Transferencia
            </Button>
            {user?.rol === 'admin' && (
              <Button 
                onClick={() => navigate('/usuarios')}
                variant="secondary"
                fullWidth
              >
                <UserPlus size={18} style={{ marginRight: 'var(--space-3)' }} /> Gestionar Usuarios
              </Button>
            )}
            {user?.rol === 'cliente' && (
              <Button 
                onClick={() => navigate('/cuentas')}
                variant="secondary"
                fullWidth
              >
                <Wallet size={18} style={{ marginRight: 'var(--space-3)' }} /> Mis Cuentas
              </Button>
            )}
          </div>
          
          <div style={{ 
            marginTop: 'var(--space-10)', 
            padding: 'var(--space-5)', 
            backgroundColor: 'var(--color-bg-subtle)', 
            borderRadius: 'var(--radius-md)', 
            border: 'var(--border-subtle)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-3)'
          }}>
            <h4 style={{ fontSize: 'var(--text-label)', fontWeight: 600, color: 'white', textTransform: 'uppercase', letterSpacing: '1px' }}>Seguridad del Sistema</h4>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
              <ShieldCheck size={16} color="var(--color-success-500)" />
              <p style={{ fontSize: 'var(--text-caption)', color: 'var(--color-text-muted)' }}>Protección biométrica activa</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--color-success-500)' }}></div>
              <p style={{ fontSize: 'var(--text-caption)', color: 'var(--color-text-muted)' }}>Servidores encriptados</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
