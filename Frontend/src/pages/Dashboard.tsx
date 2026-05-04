import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Landmark, Users, CreditCard, ArrowUpRight, ArrowDownLeft, History, Send, UserPlus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { usuarioService, cuentaService, transaccionService } from '../services/api';
import type { Transaccion } from '../types';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    usuarios: 0,
    cuentas: 0,
    saldoTotal: 0,
    transaccionesHoy: 0
  });
  const [recentTxs, setRecentTxs] = useState<Transaccion[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
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

        // Get last 5 transactions
        setRecentTxs(txs.data.slice(0, 5));

        // Prepare chart data (simple aggregation by date)
        const dailyData = txs.data.reduce((acc: any, tx: Transaccion) => {
          const date = new Date(tx.createdAt).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });
          acc[date] = (acc[date] || 0) + Number(tx.monto);
          return acc;
        }, {});

        const formattedChartData = Object.entries(dailyData).map(([name, total]) => ({ name, total }));
        setChartData(formattedChartData.length > 0 ? formattedChartData : [{ name: 'Sin datos', total: 0 }]);

      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };
    fetchStats();
  }, []);

  const statItems = [
    { label: 'Total Usuarios', value: stats.usuarios, icon: <Users />, color: '#3b82f6' },
    { label: 'Cuentas Activas', value: stats.cuentas, icon: <CreditCard />, color: '#10b981' },
    { label: 'Capital Total', value: `$${stats.saldoTotal.toLocaleString()}`, icon: <Landmark />, color: '#f59e0b' },
    { label: 'Transacciones', value: stats.transaccionesHoy, icon: <ArrowUpRight />, color: '#ef4444' },
  ];

  return (
    <div className="fade-in">
      <header style={{ marginBottom: '2.5rem' }}>
        <h1 style={{ fontSize: '2.25rem', marginBottom: '0.5rem' }}>Dashboard</h1>
        <p style={{ color: 'var(--text-muted)' }}>Bienvenido al sistema de gestión bancaria centralizado.</p>
      </header>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', 
        gap: '1.5rem',
        marginBottom: '3rem'
      }}>
        {statItems.map((item, index) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="glass"
            style={{
              padding: '1.5rem',
              borderRadius: 'var(--radius)',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem'
            }}
          >
            <div style={{ 
              backgroundColor: `${item.color}20`, 
              color: item.color,
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {item.icon}
            </div>
            <div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{item.label}</p>
              <h3 style={{ fontSize: '1.75rem', marginTop: '0.25rem' }}>{item.value}</h3>
            </div>
          </motion.div>
        ))}
      </div>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '1fr',
        gap: '1.5rem' 
      }} className="dashboard-grid">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <section className="glass" style={{ padding: '1.5rem', borderRadius: 'var(--radius)' }}>
            <h2 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.25rem' }}>
              <History size={24} /> Flujo de Capital (Transacciones)
            </h2>
            <div style={{ height: '300px', width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--accent)" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="var(--accent)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                  <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v}`} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '8px' }}
                    itemStyle={{ color: 'var(--text)' }}
                  />
                  <Area type="monotone" dataKey="total" stroke="var(--accent)" fillOpacity={1} fill="url(#colorTotal)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </section>

          <section className="glass" style={{ padding: '1.5rem', borderRadius: 'var(--radius)' }}>
            <h2 style={{ marginBottom: '1.5rem', fontSize: '1.25rem' }}>Actividad Reciente</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {recentTxs.length > 0 ? recentTxs.map(tx => (
                <div key={tx.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ padding: '0.5rem', backgroundColor: 'var(--primary-light)', borderRadius: '8px', color: tx.tipo === 'deposito' ? 'var(--success)' : 'var(--error)' }}>
                      {tx.tipo === 'deposito' ? <ArrowDownLeft size={16} /> : <ArrowUpRight size={16} />}
                    </div>
                    <div>
                      <p style={{ fontWeight: 600, fontSize: '0.875rem', textTransform: 'capitalize' }}>{tx.tipo}</p>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{new Date(tx.createdAt).toLocaleString()}</p>
                    </div>
                  </div>
                  <p style={{ fontWeight: 700, color: tx.tipo === 'deposito' ? 'var(--success)' : 'var(--text)' }}>
                    {tx.tipo === 'deposito' ? '+' : '-'}${Number(tx.monto).toLocaleString()}
                  </p>
                </div>
              )) : (
                <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '1rem' }}>No hay transacciones recientes.</p>
              )}
            </div>
          </section>
        </div>

        <section className="glass" style={{ padding: '1.5rem', borderRadius: 'var(--radius)', height: 'fit-content' }}>
          <h2 style={{ marginBottom: '1.5rem', fontSize: '1.25rem' }}>Acciones Rápidas</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <button 
              onClick={() => navigate('/transacciones')}
              style={{ 
                backgroundColor: 'var(--accent)', 
                color: 'white', 
                padding: '1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.75rem',
                fontSize: '1rem',
                fontWeight: 600,
                boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
              }}>
              <Send size={18} /> Nueva Transferencia
            </button>
            <button 
              onClick={() => navigate('/usuarios')}
              style={{ 
                backgroundColor: 'var(--primary-light)', 
                color: 'var(--text)', 
                padding: '1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.75rem',
                fontSize: '1rem',
                fontWeight: 600,
                border: '1px solid var(--border)'
              }}>
              <UserPlus size={18} /> Registrar Usuario
            </button>
          </div>
          
          <div style={{ marginTop: '2rem', padding: '1rem', backgroundColor: 'var(--primary-light)', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
            <h4 style={{ marginBottom: '0.5rem', fontSize: '0.875rem' }}>Estado del Sistema</h4>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--success)' }}></div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Sincronizado con API</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Dashboard;
