import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Usuario } from '../types';
import { authService } from '../services/api';

interface AuthContextType {
  user: Usuario | null;
  loading: boolean;
  login: (user: Usuario) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        // Al usar cookies, intentamos obtener el usuario actual directamente
        // Si hay cookies válidas, esto devolverá el usuario
        const res = await authService.getMe();
        setUser(res.data);
      } catch (error) {
        // Si falla (p.ej. 401), el usuario no está autenticado
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    initAuth();
  }, []);

  const login = (userData: Usuario) => {
    setUser(userData);
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Error durante el logout:', error);
    } finally {
      setUser(null);
      window.location.href = '/login';
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
