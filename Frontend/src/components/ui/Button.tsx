import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'tertiary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  loading?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  loading = false,
  className = '',
  disabled,
  ...props
}) => {
  const widthStyle = fullWidth ? 'w-full' : '';
  const isDisabled = disabled || loading;

  return (
    <button
      disabled={isDisabled}
      className={`btn-${variant} btn-${size} ${widthStyle} ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 'var(--radius-md)',
        fontWeight: '500',
        transition: 'all 0.3s ease',
        cursor: isDisabled ? 'not-allowed' : 'pointer',
        opacity: isDisabled ? 0.5 : 1,
        width: fullWidth ? '100%' : 'auto',
        border: 'none',
        outline: 'none',
        fontFamily: 'inherit',
        gap: 'var(--space-2)',
        ...(variant === 'primary' && {
          backgroundColor: 'var(--color-accent-500)',
          color: 'var(--color-primary-900)',
          boxShadow: 'var(--shadow-gold)',
        }),
        ...(variant === 'secondary' && {
          backgroundColor: 'transparent',
          color: 'var(--color-accent-500)',
          border: 'var(--border-gold)',
        }),
        ...(variant === 'tertiary' && {
          backgroundColor: 'transparent',
          color: 'var(--color-primary-500)',
        }),
        ...(variant === 'danger' && {
          backgroundColor: 'var(--color-error-500)',
          color: 'white',
        }),
        ...(variant === 'ghost' && {
          backgroundColor: 'transparent',
          color: 'var(--color-text-muted)',
        })
      }}
      {...props}
    >
      {loading && <Loader2 size={18} className="animate-spin" />}
      {children}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
        .btn-primary:hover:not(:disabled) { background-color: var(--color-accent-700) !important; transform: translateY(-2px); }
        .btn-secondary:hover:not(:disabled) { background-color: rgba(201, 168, 76, 0.08) !important; transform: translateY(-2px); }
        .btn-tertiary:hover:not(:disabled) { background-color: rgba(37, 99, 176, 0.08) !important; }
        .btn-danger:hover:not(:disabled) { background-color: var(--color-error-700) !important; transform: translateY(-2px); }
        .btn-ghost:hover:not(:disabled) { background-color: rgba(122, 146, 171, 0.08) !important; }
        
        .btn-sm { padding: var(--space-2) var(--space-4); font-size: var(--text-body-sm); }
        .btn-md { padding: var(--space-3) var(--space-5); font-size: var(--text-body); }
        .btn-lg { padding: var(--space-4) var(--space-8); font-size: var(--text-body-lg); }
      `}</style>
    </button>
  );
};

export default Button;
