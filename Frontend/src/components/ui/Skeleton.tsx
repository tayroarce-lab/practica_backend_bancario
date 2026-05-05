import React from 'react';

interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  borderRadius?: string;
  style?: React.CSSProperties;
  className?: string;
}

const Skeleton: React.FC<SkeletonProps> = ({ 
  width = '100%', 
  height = '1rem', 
  borderRadius = 'var(--radius-md)',
  style,
  className = ''
}) => {
  return (
    <div 
      className={`skeleton-pulse ${className}`}
      style={{
        width,
        height,
        borderRadius,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        backgroundImage: 'linear-gradient(90deg, rgba(255, 255, 255, 0), rgba(255, 255, 255, 0.03), rgba(255, 255, 255, 0))',
        backgroundSize: '200% 100%',
        ...style
      }}
    />
  );
};

export default Skeleton;
