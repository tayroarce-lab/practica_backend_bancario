import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  maxWidth?: string;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, maxWidth = '500px' }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 'var(--space-4)',
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          backdropFilter: 'blur(8px)'
        }}>
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            style={{
              width: '100%',
              maxWidth,
              backgroundColor: 'var(--color-bg-surface)',
              borderRadius: 'var(--radius-lg)',
              border: 'var(--border-gold)',
              boxShadow: 'var(--shadow-xl)',
              overflow: 'hidden',
              position: 'relative'
            }}
          >
            {/* Header */}
            <div style={{
              padding: 'var(--space-6) var(--space-8)',
              borderBottom: 'var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'linear-gradient(to right, rgba(201,168,76,0.05), transparent)'
            }}>
              <h2 className="font-display" style={{ 
                fontSize: '1.25rem', 
                fontWeight: 600, 
                color: 'white',
                margin: 0
              }}>
                {title}
              </h2>
              <button 
                onClick={onClose}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--color-text-muted)',
                  cursor: 'pointer',
                  padding: 'var(--space-2)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = 'white'}
                onMouseLeave={(e) => e.currentTarget.style.color = 'var(--color-text-muted)'}
              >
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div style={{ padding: 'var(--space-8)' }}>
              {children}
            </div>
          </motion.div>
          
          {/* Overlay click to close */}
          <div 
            onClick={onClose}
            style={{ position: 'absolute', inset: 0, zIndex: -1 }}
          />
        </div>
      )}
    </AnimatePresence>
  );
};

export default Modal;
