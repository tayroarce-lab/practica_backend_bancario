import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, CreditCard, Landmark, History } from 'lucide-react';

const Navbar: React.FC = () => {
  const navItems = [
    { to: '/', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
    { to: '/usuarios', icon: <Users size={20} />, label: 'Usuarios' },
    { to: '/cuentas', icon: <CreditCard size={20} />, label: 'Cuentas' },
    { to: '/prestamos', icon: <Landmark size={20} />, label: 'Préstamos' },
    { to: '/transacciones', icon: <History size={20} />, label: 'Historial' },
  ];

  return (
    <nav className="glass" style={{
      position: 'fixed',
      left: 0,
      top: 0,
      bottom: 0,
      width: '260px',
      padding: '2rem 1rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '2rem',
      zIndex: 100
    }}>
      <div style={{ padding: '0 1rem', marginBottom: '1rem' }}>
        <h1 style={{ 
          fontSize: '1.5rem', 
          color: 'var(--accent)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <Landmark size={32} />
          <span>Antigravity Bank</span>
        </h1>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              padding: '0.875rem 1rem',
              textDecoration: 'none',
              color: isActive ? 'var(--text)' : 'var(--text-muted)',
              backgroundColor: isActive ? 'var(--primary-light)' : 'transparent',
              borderRadius: 'var(--radius)',
              transition: 'var(--transition)',
              fontWeight: 600
            })}
          >
            {item.icon}
            {item.label}
          </NavLink>
        ))}
      </div>
    </nav>
  );
};

export default Navbar;
