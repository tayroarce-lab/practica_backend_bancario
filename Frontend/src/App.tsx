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
import { AuthProvider, useAuth } from './context/AuthContext';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return null; // O un spinner de carga

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

const AppContent: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="app-container">
      {user && <Navbar />}
      <main className="main-content">
        <Routes>
          <Route path="/login" element={!user ? <LoginPage /> : <Navigate to="/" />} />
          <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/usuarios" element={<ProtectedRoute><Usuarios /></ProtectedRoute>} />
          <Route path="/cuentas" element={<ProtectedRoute><Cuentas /></ProtectedRoute>} />
          <Route path="/prestamos" element={<ProtectedRoute><Prestamos /></ProtectedRoute>} />
          <Route path="/transacciones" element={<ProtectedRoute><Transacciones /></ProtectedRoute>} />
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
