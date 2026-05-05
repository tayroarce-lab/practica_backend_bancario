import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Usuarios from './pages/Usuarios';
import Cuentas from './pages/Cuentas';
import Prestamos from './pages/Prestamos';
import Transacciones from './pages/Transacciones';
import LoginPage from './pages/LoginPage';
import SessionMonitor from './components/auth/SessionMonitor';
import { AuthProvider, useAuth } from './context/AuthContext';
import { useSocket } from './hooks/useSocket';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return null;

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

const RoleRoute: React.FC<{ children: React.ReactNode, roles: string[] }> = ({ children, roles }) => {
  const { user, loading } = useAuth();

  if (loading) return null;

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!roles.includes(user.rol || '')) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

const AppContent: React.FC = () => {
  const { user } = useAuth();
  useSocket();

  return (
    <div className="app-container">
      <SessionMonitor />
      {user && <Navbar />}
      <main className="main-content">
        <Routes>
          <Route path="/login" element={!user ? <LoginPage /> : <Navigate to="/" />} />
          
          <Route path="/" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          
          <Route path="/usuarios" element={
            <RoleRoute roles={['admin', 'empleado']}>
              <Usuarios />
            </RoleRoute>
          } />
          
          <Route path="/cuentas" element={
            <RoleRoute roles={['admin', 'empleado']}>
              <Cuentas />
            </RoleRoute>
          } />
          
          <Route path="/prestamos" element={
            <ProtectedRoute>
              <Prestamos />
            </ProtectedRoute>
          } />
          
          <Route path="/transacciones" element={
            <ProtectedRoute>
              <Transacciones />
            </ProtectedRoute>
          } />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Toaster position="top-right" richColors closeButton theme="dark" />
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;
