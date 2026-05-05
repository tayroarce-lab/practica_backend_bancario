import React from 'react';
import { CheckCircle2, XCircle, AlertTriangle, Info } from 'lucide-react';

interface AlertProps {
  type?: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  children: React.ReactNode;
}

const Alert: React.FC<AlertProps> = ({ type = 'info', title, children }) => {
  const getSpecs = (t: string) => {
    switch (t) {
      case 'success':
        return { bg: 'var(--color-success-100)', border: 'var(--color-success-500)', text: 'var(--color-success-700)', icon: <CheckCircle2 size={20} /> };
      case 'error':
        return { bg: 'var(--color-error-100)', border: 'var(--color-error-500)', text: 'var(--color-error-700)', icon: <XCircle size={20} /> };
      case 'warning':
        return { bg: 'var(--color-warning-100)', border: 'var(--color-warning-500)', text: 'var(--color-warning-700)', icon: <AlertTriangle size={20} /> };
      case 'info':
      default:
        return { bg: 'var(--color-info-100)', border: 'var(--color-info-500)', text: 'var(--color-info-700)', icon: <Info size={20} /> };
    }
  };

  const specs = getSpecs(type);

  return (
    <div style={{
      display: 'flex',
      gap: 'var(--space-4)',
      padding: 'var(--space-4)',
      backgroundColor: specs.bg,
      borderRadius: 'var(--radius-md)',
      borderLeft: `4px solid ${specs.border}`,
      color: specs.text,
      marginBottom: 'var(--space-4)',
      fontFamily: 'var(--font-body)'
    }}>
      <div style={{ flexShrink: 0 }}>{specs.icon}</div>
      <div>
        {title && <h5 style={{ margin: 0, fontWeight: '700', fontSize: 'var(--text-body)', marginBottom: 'var(--space-1)' }}>{title}</h5>}
        <div style={{ fontSize: 'var(--text-body-sm)', lineHeight: '1.5' }}>{children}</div>
      </div>
    </div>
  );
};

export default Alert;
