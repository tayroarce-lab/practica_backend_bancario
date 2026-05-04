import axios, { AxiosError } from 'axios';
import type { 
  Usuario, 
  Cuenta, 
  Transaccion, 
  Prestamo, 
  CreateUsuarioDTO, 
  CreateCuentaDTO, 
  CreateTransferenciaDTO, 
  CreatePrestamoDTO 
} from '../types';

/**
 * SECURITY: Centralized API configuration.
 * In a real-world app, baseURL should come from an environment variable.
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // Security: Prevent long-hanging requests
});

/**
 * SECURITY & CYBERSECURITY: Sanitize data before sending to server.
 * Basic protection against injection attempts and ensuring data integrity.
 */
const sanitize = <T>(data: T): T => {
  if (typeof data !== 'object' || data === null) return data;
  
  const sanitized = { ...data } as any;
  for (const key in sanitized) {
    if (typeof sanitized[key] === 'string') {
      // Basic string trimming and HTML tag removal
      sanitized[key] = sanitized[key].trim().replace(/<[^>]*>?/gm, '');
    }
  }
  return sanitized;
};

/**
 * Error Handling Interceptor
 * Prevents leaking sensitive server information to the UI.
 */
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const customError = {
      message: (error.response?.data as any)?.error || 'Ocurrió un error inesperado en el servidor.',
      status: error.response?.status,
      originalError: import.meta.env.DEV ? error : null,
    };
    return Promise.reject(customError);
  }
);

export const usuarioService = {
  getUsuarios: () => api.get<Usuario[]>('/usuarios'),
  getUsuario: (id: number) => api.get<Usuario>(`/usuarios/${id}`),
  crearUsuario: (data: CreateUsuarioDTO) => api.post<Usuario>('/usuarios', sanitize(data)),
  actualizarUsuario: (id: number, data: Partial<CreateUsuarioDTO>) => 
    api.put<Usuario>(`/usuarios/${id}`, sanitize(data)),
  eliminarUsuario: (id: number) => api.delete(`/usuarios/${id}`),
};

export const cuentaService = {
  getCuentas: () => api.get<Cuenta[]>('/cuentas'),
  getCuenta: (id: number) => api.get<Cuenta>(`/cuentas/${id}`),
  getCuentasPorUsuario: (usuarioId: number) => api.get<Cuenta[]>(`/cuentas/usuario/${usuarioId}`),
  crearCuenta: (data: CreateCuentaDTO) => api.post<Cuenta>('/cuentas', sanitize(data)),
  actualizarEstado: (id: number, estado: 'activa' | 'bloqueada' | 'inactiva') => 
    api.put<{ message: string; cuenta: Cuenta }>(`/cuentas/${id}/estado`, { estado }),
  depositar: (id: number, monto: number, descripcion?: string) => 
    api.post(`/cuentas/${id}/deposito`, sanitize({ monto, descripcion })),
  retirar: (id: number, monto: number, descripcion?: string) => 
    api.post(`/cuentas/${id}/retiro`, sanitize({ monto, descripcion })),
};

export const transaccionService = {
  getTransacciones: () => api.get<Transaccion[]>('/transacciones'),
  getTransaccionesPorCuenta: (cuentaId: number) => api.get<Transaccion[]>(`/transacciones/cuenta/${cuentaId}`),
  realizarTransferencia: (data: CreateTransferenciaDTO) => 
    api.post('/transacciones/transferencia', sanitize(data)),
};

export const prestamoService = {
  getPrestamos: () => api.get<Prestamo[]>('/prestamos'),
  getPrestamosPorUsuario: (usuarioId: number) => api.get<Prestamo[]>(`/prestamos/usuario/${usuarioId}`),
  solicitarPrestamo: (data: CreatePrestamoDTO) => api.post<Prestamo>('/prestamos', sanitize(data)),
  aprobarPrestamo: (id: number, cuentaDesembolsoId: number) => 
    api.put(`/prestamos/${id}/aprobar`, { cuentaDesembolsoId }),
  rechazarPrestamo: (id: number) => api.put(`/prestamos/${id}/rechazar`),
};

export default api;
