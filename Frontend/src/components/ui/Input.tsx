import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

const Input: React.FC<InputProps> = ({ label, error, icon, ...props }) => {
  return (
    <div style={{ marginBottom: 'var(--space-5)', width: '100%' }}>
      {label && (
        <label 
          style={{ 
            display: 'block', 
            marginBottom: 'var(--space-2)', 
            fontSize: 'var(--text-label)',
            fontWeight: '500',
            color: 'var(--color-text-secondary)',
            fontFamily: 'var(--font-body)'
          }}
        >
          {label}
        </label>
      )}
      <div style={{ position: 'relative' }}>
        {icon && (
          <div style={{ 
            position: 'absolute', 
            left: 'var(--space-4)', 
            top: '50%', 
            transform: 'translateY(-50%)',
            color: 'var(--color-text-muted)',
            display: 'flex',
            alignItems: 'center'
          }}>
            {icon}
          </div>
        )}
        <input
          style={{
            width: '100%',
            backgroundColor: 'var(--color-primary-800)',
            border: error ? '1px solid var(--color-error-500)' : 'var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: `var(--space-3) var(--space-4) var(--space-3) ${icon ? 'var(--space-10)' : 'var(--space-4)'}`,
            color: 'var(--color-text-primary)',
            fontSize: 'var(--text-body)',
            fontFamily: 'var(--font-body)',
            transition: 'all 0.3s ease',
            outline: 'none'
          }}
          className="brand-input"
          {...props}
        />
      </div>
      {error && (
        <span style={{ 
          display: 'block', 
          marginTop: 'var(--space-1)', 
          fontSize: 'var(--text-caption)', 
          color: 'var(--color-error-500)' 
        }}>
          {error}
        </span>
      )}
      <style>{`
        .brand-input:focus {
          border-color: var(--color-accent-500) !important;
          box-shadow: 0 0 0 3px rgba(201, 168, 76, 0.2) !important;
          background-color: var(--color-primary-700) !important;
        }
        .brand-input:disabled {
          background-color: var(--color-bg-muted) !important;
          color: var(--color-text-muted) !important;
          cursor: not-allowed;
        }
        .brand-input::placeholder {
          color: var(--color-text-muted);
        }
      `}</style>
    </div>
  );
};

export default Input;
