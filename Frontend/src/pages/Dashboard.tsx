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
  ArrowLeftRight,
  CreditCard,
  Clock,
  Users,
  DollarSign,
  AlertCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { dashboardService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import type { DashboardStats, DashboardChart } from '../types';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Skeleton from '../components/ui/Skeleton';
import Badge from '../components/ui/Badge';

// ── Componente de Tarjeta de Estadística ─────────────────────────────────────
const StatCard: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: string | number;
  sub?: string;
  delay?: number;
}> = ({ icon, label, value, sub, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, delay }}
    style={{
      backgroundColor: 'var(--color-bg-card)',
      border: 'var(--border-subtle)',
      borderRadius: 'var(--radius-lg)',
      padding: 'var(--space-6)',
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--space-3)',
    }}
  >
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <div style={{
        width: '44px', height: '44px',
        backgroundColor: 'rgba(201,168,76,0.1)',
        borderRadius: 'var(--radius-md)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: 'var(--color-accent-500)'
      }}>
        {icon}
      </div>
    </div>
    <div>
      <p style={{ fontSize: 'var(--text-caption)', color: 'var(--color-text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
        {label}
      </p>
      <p className="font-display" style={{ fontSize: 'clamp(1.4rem, 2vw, 1.75rem)', fontWeight: 700, color: 'white', marginTop: 'var(--space-1)' }}>
        {value}
      </p>
      {sub && <p style={{ fontSize: 'var(--text-caption)', color: 'var(--color-text-muted)', marginTop: '2px' }}>{sub}</p>}
    </div>
  </motion.div>
);

// ── Fila de Transacción ───────────────────────────────────────────────────────
const TxRow: React.FC<{ tx: any }> = ({ tx }) => {
  const isDeposito = tx.tipo === 'deposito';
  const isRetiro = tx.tipo === 'retiro';
  const color = isDeposito ? 'var(--color-success-500)' : isRetiro ? 'var(--color-error-500)' : 'var(--color-accent-500)';
  const prefix = isDeposito ? '+' : isRetiro ? '-' : '↔';
  const Icon = isDeposito ? ArrowDownLeft : isRetiro ? ArrowUpRight : ArrowLeftRight;

  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: 'var(--space-3) var(--space-4)',
      backgroundColor: 'rgba(255,255,255,0.02)',
      borderRadius: 'var(--radius-md)',
      border: '1px solid rgba(255,255,255,0.03)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
        <div style={{
          width: '36px', height: '36px', borderRadius: '50%',
          backgroundColor: `${color}1A`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color, flexShrink: 0
        }}>
          <Icon size={16} />
        </div>
        <div>
          <p style={{ fontSize: 'var(--text-body-sm)', fontWeight: 600, color: 'white', margin: 0 }}>
            {tx.descripcion || tx.tipo}
          </p>
          <p style={{ fontSize: 'var(--text-caption)', color: 'var(--color-text-muted)', margin: 0 }}>
            {new Date(tx.fecha || tx.createdAt).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
      </div>
      <p className="font-mono" style={{ color, fontWeight: 700, fontSize: 'var(--text-body-sm)' }}>
        {prefix}${Number(tx.monto).toLocaleString('es-ES', { minimumFractionDigits: 2 })}
      </p>
    </div>
  );
};

// ── Dashboard Principal ───────────────────────────────────────────────────────
const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [dashData, setDashData] = useState<DashboardStats | null>(null);
  const [chartData, setChartData] = useState<DashboardChart>([]);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const fetchData = async () => {
      try {
        const [statsRes, chartRes] = await Promise.all([
          dashboardService.getStats(),
          dashboardService.getChart()
        ]);
        setDashData(statsRes.data);
        setChartData(chartRes.data);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const isAdmin = user?.rol === 'admin' || user?.rol === 'empleado';

  if (loading) {
    return (
      <div className="fade-in" style={{ padding: 'var(--space-8)', display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
        <Skeleton height={40} width={300} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-4)' }}>
          {[1, 2, 3, 4].map(i => <Skeleton key={i} height={140} />)}
        </div>
        <Skeleton height={320} />
        <Skeleton height={280} />
      </div>
    );
  }

  // ── Vista Administrativa ──────────────────────────────────────────────────
  if (isAdmin && dashData) {
    const { stats, recentTxs } = dashData;
    return (
      <div className="fade-in" style={{ padding: 'var(--space-8)', display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' }}>
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <p style={{ fontSize: 'var(--text-caption)', color: 'var(--color-accent-500)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            Panel de Control
          </p>
          <h1 className="h1">OldMoney Bank <span style={{ color: 'var(--color-accent-500)' }}>—</span> Vista Global</h1>
          <p className="text-secondary">Resumen operativo del sistema financiero en tiempo real.</p>
        </motion.div>

        {/* Stats Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 'var(--space-4)' }}>
          <StatCard delay={0.0} icon={<Users size={22} />} label="Clientes Activos" value={stats.totalUsuarios ?? 0} sub="Usuarios registrados" />
          <StatCard delay={0.1} icon={<CreditCard size={22} />} label="Cuentas Activas" value={stats.totalCuentas ?? 0} sub="En el sistema" />
          <StatCard delay={0.2} icon={<DollarSign size={22} />} label="Patrimonio Total"
            value={`$${(stats.saldoTotal ?? 0).toLocaleString('es-ES', { minimumFractionDigits: 2 })}`}
            sub="Saldo consolidado" />
          <StatCard delay={0.3} icon={<TrendingUp size={22} />} label="Transacciones Hoy" value={stats.transaccionesHoy ?? 0} sub="Operaciones del día" />
          <StatCard delay={0.4} icon={<AlertCircle size={22} />} label="Préstamos Pendientes"
            value={stats.prestamosPendientes ?? 0}
            sub={stats.prestamosPendientes! > 0 ? 'Requieren revisión' : 'Sin pendientes'} />
        </div>

        {/* Chart */}
        <Card title="Flujo de Capital" subtitle="Volumen de transacciones — Últimos 30 días">
          <div style={{ width: '100%', height: 300, minHeight: 0, overflow: 'hidden' }}>
            {isMounted && (
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-accent-500)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="var(--color-accent-500)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="name" tick={{ fill: 'var(--color-text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: 'var(--color-text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}`} />
                  <Tooltip
                    contentStyle={{ backgroundColor: 'var(--color-bg-card)', border: 'var(--border-subtle)', borderRadius: 'var(--radius-md)', color: 'white' }}
                    formatter={(value: number) => [`$${value.toLocaleString()}`, 'Volumen']}
                  />
                  <Area type="monotone" dataKey="total" stroke="var(--color-accent-500)" strokeWidth={2} fill="url(#colorTotal)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>

        {/* Bottom Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 'var(--space-6)' }}>
          {/* Actividad Reciente */}
          <Card title="Actividad Reciente" subtitle="Últimas 5 transacciones del sistema">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
              {recentTxs.length > 0
                ? recentTxs.map(tx => <TxRow key={tx.id} tx={tx} />)
                : <p className="text-muted" style={{ textAlign: 'center', padding: 'var(--space-6)' }}>Sin transacciones registradas.</p>
              }
            </div>
          </Card>

          {/* Acciones Rápidas */}
          <Card title="Acciones Rápidas" subtitle="Gestión directa">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              <Button onClick={() => navigate('/transacciones')} fullWidth>
                <Send size={16} style={{ marginRight: 'var(--space-2)' }} /> Nueva Transferencia
              </Button>
              {user?.rol === 'admin' && (
                <Button onClick={() => navigate('/usuarios')} variant="secondary" fullWidth>
                  <UserPlus size={16} style={{ marginRight: 'var(--space-2)' }} /> Gestionar Usuarios
                </Button>
              )}
              <Button onClick={() => navigate('/cuentas')} variant="secondary" fullWidth>
                <Wallet size={16} style={{ marginRight: 'var(--space-2)' }} /> Gestionar Cuentas
              </Button>
              <Button onClick={() => navigate('/prestamos')} variant="secondary" fullWidth>
                <Landmark size={16} style={{ marginRight: 'var(--space-2)' }} /> Ver Préstamos
              </Button>
              <div style={{ marginTop: 'var(--space-4)', padding: 'var(--space-4)', backgroundColor: 'var(--color-bg-subtle)', borderRadius: 'var(--radius-md)', border: 'var(--border-subtle)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-2)' }}>
                  <ShieldCheck size={14} color="var(--color-success-500)" />
                  <p style={{ fontSize: 'var(--text-caption)', fontWeight: 600, color: 'white' }}>Sistema Seguro</p>
                </div>
                <p style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>Sesión cifrada · Cookies HttpOnly · TLS activo</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // ── Vista Cliente ─────────────────────────────────────────────────────────
  if (!isAdmin && dashData) {
    const { stats, recentTxs, misCuentas = [], misPrestamos = [] } = dashData;
    return (
      <div className="fade-in" style={{ padding: 'var(--space-8)', display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' }}>
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <p style={{ fontSize: 'var(--text-caption)', color: 'var(--color-accent-500)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            Bienvenido
          </p>
          <h1 className="h1">{user?.nombre} <span style={{ color: 'var(--color-accent-500)' }}>{user?.apellido}</span></h1>
          <p className="text-secondary">Resumen de su patrimonio personal.</p>
        </motion.div>

        {/* Stats Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 'var(--space-4)' }}>
          <StatCard delay={0.0} icon={<CreditCard size={22} />} label="Mis Cuentas" value={stats.totalCuentas ?? 0} sub="Cuentas activas" />
          <StatCard delay={0.1} icon={<DollarSign size={22} />} label="Mi Saldo Total"
            value={`$${(stats.miSaldoTotal ?? 0).toLocaleString('es-ES', { minimumFractionDigits: 2 })}`}
            sub="Patrimonio consolidado" />
          <StatCard delay={0.2} icon={<Landmark size={22} />} label="Préstamos Activos" value={stats.prestamosActivos ?? 0} sub="Créditos vigentes" />
          <StatCard delay={0.3} icon={<Clock size={22} />} label="Movimientos Hoy" value={stats.transaccionesHoy ?? 0} sub="Operaciones del día" />
        </div>

        {/* Chart */}
        <Card title="Mis Movimientos" subtitle="Historial de operaciones — Últimos 30 días">
          <div style={{ width: '100%', height: 300, minHeight: 0, overflow: 'hidden' }}>
            {isMounted && (
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorMio" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-accent-500)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="var(--color-accent-500)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="name" tick={{ fill: 'var(--color-text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: 'var(--color-text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}`} />
                  <Tooltip
                    contentStyle={{ backgroundColor: 'var(--color-bg-card)', border: 'var(--border-subtle)', borderRadius: 'var(--radius-md)', color: 'white' }}
                    formatter={(value: number) => [`$${value.toLocaleString()}`, 'Monto']}
                  />
                  <Area type="monotone" dataKey="total" stroke="var(--color-accent-500)" strokeWidth={2} fill="url(#colorMio)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>

        {/* Bottom Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 'var(--space-6)' }}>
          {/* Actividad Reciente + Mis Cuentas */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
            <Card title="Mis Últimas Transacciones" subtitle="Historial de operaciones recientes">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                {recentTxs.length > 0
                  ? recentTxs.map(tx => <TxRow key={tx.id} tx={tx} />)
                  : <p className="text-muted" style={{ textAlign: 'center', padding: 'var(--space-6)' }}>No tiene transacciones registradas.</p>
                }
              </div>
            </Card>

            {/* Mis Cuentas */}
            {misCuentas.length > 0 && (
              <Card title="Mis Cuentas" subtitle="Resumen de sus cuentas activas">
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                  {misCuentas.map(cuenta => (
                    <div key={cuenta.id} style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      padding: 'var(--space-4)',
                      backgroundColor: 'rgba(255,255,255,0.02)',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid rgba(255,255,255,0.03)'
                    }}>
                      <div>
                        <p className="font-mono" style={{ fontSize: 'var(--text-body-sm)', color: 'var(--color-accent-500)', margin: 0 }}>
                          {cuenta.numeroCuenta}
                        </p>
                        <p style={{ fontSize: 'var(--text-caption)', color: 'var(--color-text-muted)', margin: 0 }}>
                          {(cuenta.tipoCuenta as any)?.nombre || 'Cuenta'}
                        </p>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <p className="font-mono" style={{ fontWeight: 700, color: 'white', margin: 0 }}>
                          ${Number(cuenta.saldo).toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                        </p>
                        <Badge status={cuenta.estado} />
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Mis Préstamos */}
            {misPrestamos.length > 0 && (
              <Card title="Mis Préstamos" subtitle="Estado de sus líneas de crédito">
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                  {misPrestamos.slice(0, 3).map(loan => (
                    <div key={loan.id} style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      padding: 'var(--space-4)',
                      backgroundColor: 'rgba(255,255,255,0.02)',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid rgba(255,255,255,0.03)'
                    }}>
                      <div>
                        <p style={{ fontWeight: 600, color: 'white', margin: 0, fontSize: 'var(--text-body-sm)' }}>
                          Préstamo #{String(loan.id).padStart(4, '0')}
                        </p>
                        <p style={{ fontSize: 'var(--text-caption)', color: 'var(--color-text-muted)', margin: 0 }}>
                          Cuota: ${Number(loan.cuotaMensual).toLocaleString()} / mes
                        </p>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <p className="font-mono" style={{ color: 'white', margin: 0, fontWeight: 700, fontSize: 'var(--text-body-sm)' }}>
                          ${Number(loan.monto).toLocaleString()}
                        </p>
                        <Badge status={loan.estado} />
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>

          {/* Acciones Rápidas */}
          <Card title="Acciones Rápidas" subtitle="Operaciones disponibles">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              <Button onClick={() => navigate('/transacciones')} fullWidth>
                <Send size={16} style={{ marginRight: 'var(--space-2)' }} /> Hacer Transferencia
              </Button>
              <Button onClick={() => navigate('/prestamos')} variant="secondary" fullWidth>
                <Landmark size={16} style={{ marginRight: 'var(--space-2)' }} /> Solicitar Préstamo
              </Button>
              <Button onClick={() => navigate('/cuentas')} variant="secondary" fullWidth>
                <Wallet size={16} style={{ marginRight: 'var(--space-2)' }} /> Mis Cuentas
              </Button>
              <Button onClick={() => navigate('/perfil')} variant="ghost" fullWidth>
                <UserCircle size={16} style={{ marginRight: 'var(--space-2)' }} /> Mi Perfil
              </Button>
              <div style={{ marginTop: 'var(--space-4)', padding: 'var(--space-4)', backgroundColor: 'var(--color-bg-subtle)', borderRadius: 'var(--radius-md)', border: 'var(--border-subtle)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-2)' }}>
                  <ShieldCheck size={14} color="var(--color-success-500)" />
                  <p style={{ fontSize: 'var(--text-caption)', fontWeight: 600, color: 'white' }}>Cuenta Protegida</p>
                </div>
                <p style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>Sesión cifrada · Cookies HttpOnly · TLS activo</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return null;
};

export default Dashboard;
