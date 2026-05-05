import React from 'react';

interface CardProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  className?: string;
  action?: React.ReactNode;
}

const Card: React.FC<CardProps> = ({ children, title, subtitle, className = '', action }) => {
  return (
    <div className={`card ${className}`}>
      {(title || action) && (
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'flex-start',
          marginBottom: 'var(--space-6)' 
        }}>
          <div>
            {title && <h3 className="h3" style={{ margin: 0 }}>{title}</h3>}
            {subtitle && <p className="text-muted" style={{ fontSize: 'var(--text-body-sm)', marginTop: 'var(--space-1)' }}>{subtitle}</p>}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      {children}
    </div>
  );
};

export default Card;
