import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Lock, Mail, Loader2, Globe, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await authService.login({ email, password });
      login(res.data.accessToken, res.data.usuario); // Note: using accessToken as per new backend
      toast.success('Acceso autorizado. Bienvenido.');
      navigate('/');
    } catch (error) {
      // toast handled by interceptor
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ 
      height: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      padding: 'var(--space-4)',
      background: 'radial-gradient(circle at center, var(--color-primary-800) 0%, var(--color-primary-900) 100%)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Decorative background elements */}
      <div style={{ position: 'absolute', top: '-10%', right: '-5%', width: '400px', height: '400px', borderRadius: '50%', background: 'var(--color-accent-500)', opacity: 0.03, filter: 'blur(80px)' }}></div>
      <div style={{ position: 'absolute', bottom: '-10%', left: '-5%', width: '400px', height: '400px', borderRadius: '50%', background: 'var(--color-accent-500)', opacity: 0.03, filter: 'blur(80px)' }}></div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        style={{ 
          width: '100%', 
          maxWidth: '440px', 
          backgroundColor: 'var(--color-bg-surface)',
          border: 'var(--border-gold)',
          padding: 'var(--space-12) var(--space-8)',
          borderRadius: 'var(--radius-lg)',
          textAlign: 'center',
          boxShadow: '0 20px 50px rgba(0,0,0,0.5), 0 0 20px rgba(201,168,76,0.1)',
          zIndex: 10
        }}
      >
        <div style={{ marginBottom: 'var(--space-10)' }}>
          <motion.div 
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            style={{ 
              width: '80px', 
              height: '80px', 
              backgroundColor: 'var(--color-accent-500)', 
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto var(--space-6)',
              color: 'var(--color-primary-900)',
              boxShadow: 'var(--shadow-gold)'
            }}
          >
            <ShieldCheck size={40} strokeWidth={1.5} />
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <h1 className="font-display" style={{ fontSize: '2.25rem', fontWeight: 700, color: 'white', marginBottom: 'var(--space-2)' }}>
              OldMoney <span style={{ color: 'var(--color-accent-500)' }}>Bank</span>
            </h1>
            <p className="text-secondary" style={{ fontSize: 'var(--text-body)', letterSpacing: '0.5px' }}>Terminal de Acceso Seguro</p>
          </motion.div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
          <Input 
            label="Credencial de Acceso (Email)"
            type="email" 
            placeholder="institucional@oldmoney.bank" 
            icon={<Mail size={18} />}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <Input 
            label="Código de Seguridad"
            type="password" 
            placeholder="••••••••••••" 
            icon={<Lock size={18} />}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <div style={{ textAlign: 'right', marginBottom: 'var(--space-6)' }}>
            <a href="#" style={{ color: 'var(--color-accent-500)', fontSize: 'var(--text-label)', textDecoration: 'none', fontWeight: 600 }}>¿Olvidó sus credenciales?</a>
          </div>

          <Button 
            type="submit" 
            disabled={isLoading}
            fullWidth
            style={{ height: '56px', fontSize: '1.125rem' }}
          >
            {isLoading ? <Loader2 className="spin" size={24} /> : 'Validar Identidad'}
          </Button>
        </form>

        <div style={{ marginTop: 'var(--space-12)', paddingTop: 'var(--space-8)', borderTop: 'var(--border-subtle)' }}>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--space-8)', marginBottom: 'var(--space-6)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', color: 'var(--color-text-muted)', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '1px' }}>
              <Shield size={12} color="var(--color-success-500)" /> 256-bit AES
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', color: 'var(--color-text-muted)', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '1px' }}>
              <Globe size={12} color="var(--color-accent-500)" /> Global Secure
            </div>
          </div>
          <p style={{ fontSize: '10px', color: 'var(--color-text-muted)', lineHeight: 1.6 }}>
            © 2026 OldMoney Financial Services Group. <br/>
            Acceso restringido a personal autorizado y clientes premium.
          </p>
        </div>
      </motion.div>

      {/* Decorative corners */}
      <div style={{ position: 'absolute', top: '40px', left: '40px', width: '100px', height: '2px', backgroundColor: 'var(--color-accent-500)', opacity: 0.2 }}></div>
      <div style={{ position: 'absolute', top: '40px', left: '40px', width: '2px', height: '100px', backgroundColor: 'var(--color-accent-500)', opacity: 0.2 }}></div>
      <div style={{ position: 'absolute', bottom: '40px', right: '40px', width: '100px', height: '2px', backgroundColor: 'var(--color-accent-500)', opacity: 0.2 }}></div>
      <div style={{ position: 'absolute', bottom: '40px', right: '40px', width: '2px', height: '100px', backgroundColor: 'var(--color-accent-500)', opacity: 0.2 }}></div>
    </div>
  );
};

export default LoginPage;
