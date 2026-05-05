import React from 'react';

type BadgeStatus = 'pendiente' | 'aprobado' | 'rechazado' | 'pagado' | 'activa' | 'inactiva' | 'bloqueada';

interface BadgeProps {
  status: BadgeStatus | string;
  children?: React.ReactNode;
}

const Badge: React.FC<BadgeProps> = ({ status, children }) => {
  const getStyles = (s: string) => {
    switch (s.toLowerCase()) {
      case 'pendiente':
        return { bg: 'var(--color-warning-100)', text: 'var(--color-warning-700)' };
      case 'aprobado':
      case 'activa':
        return { bg: 'var(--color-success-100)', text: 'var(--color-success-700)' };
      case 'rechazado':
      case 'bloqueada':
        return { bg: 'var(--color-error-100)', text: 'var(--color-error-700)' };
      case 'pagado':
      case 'inactiva':
      default:
        return { bg: 'var(--color-bg-muted)', text: 'var(--color-text-secondary)' };
    }
  };

  const styles = getStyles(status);

  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      padding: 'var(--space-1) var(--space-3)',
      borderRadius: 'var(--radius-full)',
      fontSize: 'var(--text-label)',
      fontWeight: '600',
      backgroundColor: styles.bg,
      color: styles.text,
      textTransform: 'capitalize'
    }}>
      {children || status}
    </span>
  );
};

export default Badge;
