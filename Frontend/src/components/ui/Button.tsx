import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'tertiary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className = '',
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center rounded-md font-medium transition-all duration-300 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variants = {
    primary: 'bg-[#C9A84C] text-[#0A1628] hover:bg-[#A8820D] shadow-[0_4px_16px_rgba(201,168,76,0.25)]',
    secondary: 'bg-transparent text-[#C9A84C] border border-[#C9A84C] hover:bg-[rgba(201,168,76,0.08)]',
    tertiary: 'bg-transparent text-[#2563B0] hover:bg-[rgba(37,99,176,0.08)]',
    danger: 'bg-[#F04438] text-white hover:bg-[#9B1C1C]',
    ghost: 'bg-transparent text-[#7A92AB] hover:bg-[rgba(122,146,171,0.08)]'
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-6 py-3.5 text-base'
  };

  const widthStyle = fullWidth ? 'w-full' : '';

  // Manual CSS since we are not using Tailwind by default but the user rules said "Use Vanilla CSS... Avoid Tailwind unless requested"
  // Wait, the previous code had some tailwind-like classes but I should use standard CSS or my tokens.
  
  return (
    <button
      className={`btn-${variant} btn-${size} ${widthStyle} ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 'var(--radius-md)',
        fontWeight: '500',
        transition: 'all 0.3s ease',
        cursor: props.disabled ? 'not-allowed' : 'pointer',
        opacity: props.disabled ? 0.5 : 1,
        width: fullWidth ? '100%' : 'auto',
        border: 'none',
        outline: 'none',
        fontFamily: 'inherit',
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
      {children}
      <style>{`
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
