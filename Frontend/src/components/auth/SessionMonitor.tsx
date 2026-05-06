import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, LogOut, RefreshCw } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/api';
import Button from '../ui/Button';
import Card from '../ui/Card';

const SessionMonitor: React.FC = () => {
  const { user, logout } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [timeLeft, setTimeLeft] = useState(120); // 2 minutes countdown
  
  const handleExtend = async () => {
    try {
      // El refresh ahora se maneja automáticamente por cookies
      await authService.refresh();
      setShowModal(false);
      setTimeLeft(120);
    } catch (error) {
      logout();
    }
  };

  // Efecto 1: Iniciar el temporizador de advertencia al loguearse
  useEffect(() => {
    if (!user) {
      setShowModal(false);
      return;
    }

    const warningTimer = setTimeout(() => {
      setShowModal(true);
    }, 13 * 60 * 1000); 

    return () => clearTimeout(warningTimer);
  }, [user]);

  // Efecto 2: Gestionar el intervalo de cuenta regresiva cuando se muestra el modal
  useEffect(() => {
    let countdownInterval: any;

    if (showModal) {
      countdownInterval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(countdownInterval);
            logout();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      setTimeLeft(120);
    }

    return () => clearInterval(countdownInterval);
  }, [showModal, logout]);

  if (!showModal) return null;

  return (
    <AnimatePresence>
      <div style={{ 
        position: 'fixed', 
        inset: 0, 
        backgroundColor: 'rgba(0,0,0,0.85)', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        zIndex: 9999, 
        backdropFilter: 'blur(8px)' 
      }}>
        <motion.div 
          initial={{ scale: 0.95, opacity: 0 }} 
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          style={{ width: '100%', maxWidth: '400px' }}
        >
          <Card 
            title="Seguridad de Sesión" 
            subtitle="Su sesión está por expirar por motivos de seguridad."
          >
            <div style={{ textAlign: 'center', marginBottom: 'var(--space-8)' }}>
              <div style={{ 
                width: '64px', 
                height: '64px', 
                backgroundColor: 'rgba(201, 168, 76, 0.1)', 
                borderRadius: '50%', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                margin: '0 auto var(--space-4)',
                color: 'var(--color-accent-500)'
              }}>
                <Clock size={32} />
              </div>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-body-sm)' }}>
                Por favor, confirme si desea continuar operando.
              </p>
              <h2 className="font-mono" style={{ fontSize: '2rem', color: 'var(--color-accent-500)', marginTop: 'var(--space-4)' }}>
                {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
              </h2>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              <Button onClick={handleExtend} fullWidth>
                <RefreshCw size={18} style={{ marginRight: '8px' }} /> Extender Sesión
              </Button>
              <Button variant="ghost" onClick={logout} fullWidth>
                <LogOut size={18} style={{ marginRight: '8px' }} /> Cerrar Sesión Ahora
              </Button>
            </div>
          </Card>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default SessionMonitor;
