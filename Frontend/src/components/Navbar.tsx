import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  CreditCard, 
  Landmark, 
  History, 
  LogOut, 
  Menu, 
  X 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Navbar: React.FC = () => {
  const { logout, user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { to: '/', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
    { to: '/usuarios', icon: <Users size={20} />, label: 'Usuarios' },
    { to: '/cuentas', icon: <CreditCard size={20} />, label: 'Cuentas' },
    { to: '/prestamos', icon: <Landmark size={20} />, label: 'Préstamos' },
    { to: '/transacciones', icon: <History size={20} />, label: 'Historial' },
  ];

  return (
    <>
      {/* Mobile Header */}
      <header className="glass" style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        padding: '1rem', 
        position: 'sticky', 
        top: 0, 
        zIndex: 50,
        marginBottom: '1rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Landmark className="bac-brand-accent" size={24} />
          <span className="bac-logo-text">Antigravity<span className="bac-brand-accent">Bank</span></span>
        </div>
        <button 
          onClick={() => setIsOpen(!isOpen)}
          style={{ backgroundColor: 'transparent', padding: '0.5rem' }}
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </header>

      {/* Sidebar Navigation */}
      <nav className={`glass ${isOpen ? 'open' : ''}`} style={{
        position: 'fixed',
        left: 0,
        top: 0,
        bottom: 0,
        width: '280px',
        zIndex: 100,
        padding: '2rem 1.5rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '2rem',
        transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
        transition: 'transform 0.3s ease'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
          <div style={{ padding: '0.5rem', backgroundColor: 'var(--accent)', borderRadius: '8px' }}>
            <Landmark size={24} color="white" />
          </div>
          <span className="bac-logo-text">Antigravity<span className="bac-brand-accent">Bank</span></span>
        </div>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setIsOpen(false)}
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                padding: '0.875rem 1rem',
                borderRadius: 'var(--radius)',
                textDecoration: 'none',
                color: isActive ? 'white' : 'var(--text-muted)',
                backgroundColor: isActive ? 'var(--accent)' : 'transparent',
                transition: 'all 0.2s ease'
              })}
            >
              {item.icon}
              <span style={{ fontWeight: 500 }}>{item.label}</span>
            </NavLink>
          ))}
        </div>

        <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem', padding: '0 0.5rem' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
              {user?.nombre?.[0]}{user?.apellido?.[0]}
            </div>
            <div>
              <p style={{ fontSize: '0.875rem', fontWeight: 600 }}>{user?.nombre}</p>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Panel Administrativo</p>
            </div>
          </div>
          <button 
            onClick={logout}
            style={{ 
              width: '100%', 
              padding: '0.875rem', 
              backgroundColor: 'rgba(239, 68, 68, 0.1)', 
              color: 'var(--error)', 
              gap: '0.75rem',
              border: '1px solid rgba(239, 68, 68, 0.2)'
            }}
          >
            <LogOut size={20} /> Cerrar Sesión
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
            backgroundColor: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(4px)',
            zIndex: 90
          }}
        />
      )}

      {/* Desktop Styling Fix (to make the nav behave like a sidebar on large screens) */}
      <style>{`
        @media (min-width: 1024px) {
          nav {
            transform: translateX(0) !important;
            position: sticky !important;
            height: 100vh;
            border-radius: 0 !important;
            border-left: none !important;
            border-top: none !important;
            border-bottom: none !important;
          }
          header { display: none !important; }
          .main-content { margin-left: 0 !important; }
        }
        .nav-link:hover {
          background-color: rgba(255, 255, 255, 0.05);
          color: white;
        }
        .nav-link.active:hover {
          background-color: var(--accent-hover);
        }
      `}</style>
    </>
  );
};

export default Navbar;
