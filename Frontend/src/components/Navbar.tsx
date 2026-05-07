import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  UserCircle, 
  Wallet, 
  Landmark, 
  History, 
  LogOut, 
  Menu, 
  X,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Navbar: React.FC = () => {
  const { logout, user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const allNavItems = [
    { to: '/', icon: <LayoutDashboard size={20} />, label: 'Dashboard', roles: ['admin', 'empleado', 'cliente'] },
    { to: '/usuarios', icon: <UserCircle size={20} />, label: 'Usuarios', roles: ['admin', 'empleado'] },
    { to: '/cuentas', icon: <Wallet size={20} />, label: 'Cuentas', roles: ['admin', 'empleado', 'cliente'] },
    { to: '/prestamos', icon: <Landmark size={20} />, label: 'Préstamos', roles: ['admin', 'empleado', 'cliente'] },
    { to: '/transacciones', icon: <History size={20} />, label: 'Historial', roles: ['admin', 'empleado', 'cliente'] },
  ];

  const navItems = allNavItems.filter(item => item.roles.includes(user?.rol || 'cliente'));

  return (
    <>
      {/* Mobile Header */}
      <header style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        padding: 'var(--space-4)', 
        position: 'sticky', 
        top: 0, 
        zIndex: 50,
        backgroundColor: 'var(--color-bg-surface)',
        borderBottom: 'var(--border-subtle)',
        marginBottom: 'var(--space-4)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          <ShieldCheck color="var(--color-accent-500)" size={24} />
          <span className="h4" style={{ margin: 0, color: 'var(--color-text-primary)' }}>OldMoney <span style={{ color: 'var(--color-accent-500)' }}>Bank</span></span>
        </div>
        <button 
          onClick={() => setIsOpen(!isOpen)}
          style={{ backgroundColor: 'transparent', padding: 'var(--space-2)', border: 'none', color: 'var(--color-text-primary)', cursor: 'pointer' }}
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </header>

      {/* Sidebar Navigation */}
      <nav className={`${isOpen ? 'open' : ''}`} style={{
        position: 'fixed',
        left: 0,
        top: 0,
        bottom: 0,
        width: '280px',
        zIndex: 100,
        backgroundColor: 'var(--color-bg-surface)',
        borderRight: 'var(--border-subtle)',
        padding: 'var(--space-8) var(--space-6)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-8)',
        transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
        transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          <div style={{ padding: 'var(--space-2)', backgroundColor: 'var(--color-accent-500)', borderRadius: 'var(--radius-md)' }}>
            <ShieldCheck size={24} color="var(--color-primary-900)" />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span className="font-display" style={{ fontSize: '1.25rem', fontWeight: 700, color: 'white', lineHeight: 1 }}>OldMoney</span>
            <span style={{ fontSize: '0.75rem', letterSpacing: '2px', color: 'var(--color-accent-500)', textTransform: 'uppercase', marginTop: '4px' }}>Bank Premium</span>
          </div>
        </div>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setIsOpen(false)}
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-4)',
                padding: 'var(--space-4) var(--space-4)',
                borderRadius: 'var(--radius-md)',
                textDecoration: 'none',
                color: isActive ? 'var(--color-primary-900)' : 'var(--color-text-secondary)',
                backgroundColor: isActive ? 'var(--color-accent-500)' : 'transparent',
                boxShadow: isActive ? 'var(--shadow-gold)' : 'none',
                transition: 'all 0.3s ease'
              })}
            >
              {item.icon}
              <span style={{ fontWeight: 600, fontSize: 'var(--text-body)' }}>{item.label}</span>
            </NavLink>
          ))}
          
          {/* Quick Action Button for Admin */}
          {user?.rol === 'admin' && (
            <div style={{ marginTop: 'var(--space-4)', padding: '0 var(--space-2)' }}>
              <button 
                onClick={() => { navigate('/usuarios'); setIsOpen(false); }}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 'var(--space-2)',
                  padding: 'var(--space-3)',
                  backgroundColor: 'rgba(201, 168, 76, 0.1)',
                  border: '1px dashed var(--color-accent-500)',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--color-accent-500)',
                  cursor: 'pointer',
                  fontSize: 'var(--text-body-sm)',
                  fontWeight: 600,
                  transition: 'all 0.3s ease'
                }}
                className="quick-action-nav"
              >
                + Nuevo Usuario
              </button>
            </div>
          )}
        </div>

        <div style={{ borderTop: 'var(--border-subtle)', paddingTop: 'var(--space-6)' }}>
          <div
            onClick={() => { navigate('/perfil'); setIsOpen(false); }}
            style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', marginBottom: 'var(--space-6)', padding: '0 var(--space-2)', cursor: 'pointer', borderRadius: 'var(--radius-md)', transition: 'background-color 0.2s' }}
            title="Ver mi perfil"
          >
            <div style={{ 
              width: '44px', 
              height: '44px', 
              borderRadius: '50%', 
              backgroundColor: 'var(--color-bg-subtle)', 
              border: 'var(--border-gold)',
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              fontWeight: 700,
              color: 'var(--color-accent-500)',
              flexShrink: 0
            }}>
              {user?.nombre?.[0]}{user?.apellido?.[0]}
            </div>
            <div style={{ overflow: 'hidden' }}>
              <p style={{ fontSize: 'var(--text-body)', fontWeight: 600, color: 'white', margin: 0, whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{user?.nombre}</p>
              <p style={{ fontSize: 'var(--text-caption)', color: 'var(--color-accent-500)', margin: 0, textTransform: 'capitalize' }}>{user?.rol}</p>
            </div>
          </div>
          <button 
            onClick={logout}
            style={{ 
              width: '100%', 
              padding: 'var(--space-4)', 
              backgroundColor: 'rgba(240, 68, 56, 0.1)', 
              color: 'var(--color-error-500)', 
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 'var(--space-3)',
              border: '1px solid rgba(240, 68, 56, 0.2)',
              cursor: 'pointer',
              fontWeight: 600,
              transition: 'all 0.3s ease'
            }}
            className="logout-btn"
          >
            <LogOut size={18} /> Cerrar Sesión
          </button>
        </div>
      </nav>

      {/* Mobile Sidebar Overlay */}
      {isOpen && (
        <div 
          onClick={() => setIsOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.7)',
            backdropFilter: 'blur(4px)',
            zIndex: 90
          }}
        />
      )}

      <style>{`
        @media (min-width: 1024px) {
          nav {
            transform: translateX(0) !important;
            position: sticky !important;
            height: 100vh;
          }
          header { display: none !important; }
        }
        .nav-link:hover:not(.active) {
          background-color: var(--color-bg-subtle);
          color: white;
          transform: translateX(4px);
        }
        .logout-btn:hover {
          background-color: var(--color-error-500) !important;
          color: white !important;
        }
      `}</style>
    </>
  );
};

export default Navbar;
