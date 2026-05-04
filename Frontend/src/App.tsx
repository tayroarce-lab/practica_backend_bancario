import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import UsuariosPage from './pages/Usuarios';
import CuentasPage from './pages/Cuentas';
import PrestamosPage from './pages/Prestamos';
import TransaccionesPage from './pages/Transacciones';



const App: React.FC = () => {
  return (
    <Router>
      <div style={{ display: 'flex', minHeight: '100vh' }}>
        <Navbar />
        <main style={{ 
          flex: 1, 
          marginLeft: '260px', 
          padding: '2.5rem',
          maxWidth: '1400px'
        }}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/usuarios" element={<UsuariosPage />} />
            <Route path="/cuentas" element={<CuentasPage />} />
            <Route path="/prestamos" element={<PrestamosPage />} />
            <Route path="/transacciones" element={<TransaccionesPage />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default App;
