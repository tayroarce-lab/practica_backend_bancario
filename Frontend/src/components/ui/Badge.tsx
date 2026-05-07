import React from 'react';

type BadgeStatus =
  | 'pendiente' | 'aprobado' | 'rechazado' | 'pagado'
  | 'activa' | 'inactiva' | 'bloqueada'
  | 'admin' | 'empleado' | 'cliente';

interface BadgeProps {
  status: BadgeStatus | string;
  children?: React.ReactNode;
}

const Badge: React.FC<BadgeProps> = ({ status, children }) => {
  const getStyles = (s: string) => {
    if (!s) return { bg: 'rgba(255,255,255,0.06)', text: 'var(--color-text-muted)' };
    switch (s.toLowerCase()) {
      case 'pendiente':
        return { bg: 'rgba(201,168,76,0.15)', text: 'var(--color-accent-500)' };
      case 'aprobado':
      case 'activa':
        return { bg: 'rgba(18,183,106,0.12)', text: 'var(--color-success-500)' };
      case 'rechazado':
      case 'bloqueada':
        return { bg: 'rgba(239,68,68,0.12)', text: 'var(--color-error-500)' };
      case 'pagado':
      case 'inactiva':
        return { bg: 'rgba(255,255,255,0.06)', text: 'var(--color-text-muted)' };
      // Roles
      case 'admin':
        return { bg: 'rgba(201,168,76,0.2)', text: 'var(--color-accent-500)' };
      case 'empleado':
        return { bg: 'rgba(59,130,246,0.15)', text: '#60a5fa' };
      case 'cliente':
        return { bg: 'rgba(255,255,255,0.06)', text: 'var(--color-text-secondary)' };
      default:
        return { bg: 'rgba(255,255,255,0.06)', text: 'var(--color-text-muted)' };
    }
  };

  const styles = getStyles(status);

  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      padding: '2px 10px',
      borderRadius: 'var(--radius-full)',
      fontSize: 'var(--text-label)',
      fontWeight: 600,
      backgroundColor: styles.bg,
      color: styles.text,
      textTransform: 'capitalize',
      letterSpacing: '0.03em',
      whiteSpace: 'nowrap'
    }}>
      {children || status}
    </span>
  );
};

export default Badge;
