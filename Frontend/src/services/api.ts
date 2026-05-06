import axios, { AxiosError } from 'axios';
import { toast } from 'sonner';
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
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
  timeout: 10000,
});

// Flag to prevent multiple refresh calls
let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// No necesitamos interceptor de peticiones para el token ya que se envía por cookie automáticamente
// pero dejamos el esqueleto por si se necesitan otros headers en el futuro
api.interceptors.request.use((config) => {
  return config;
});

/**
 * SECURITY & CYBERSECURITY: Sanitize data
 */
const sanitize = <T>(data: T): T => {
  if (typeof data !== 'object' || data === null) return data;
  const sanitized = { ...data } as any;
  for (const key in sanitized) {
    if (typeof sanitized[key] === 'string') {
      sanitized[key] = sanitized[key].trim().replace(/<[^>]*>?/gm, '');
    }
  }
  return sanitized;
};

// Response Interceptor for Auto-Refresh
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as any;
    
    // Si es un 401 y no es la ruta de login ni ya se intentó refrescar
    if (error.response?.status === 401 && !originalRequest._retry && !originalRequest.url?.includes('/auth/login')) {
      
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
        .then(() => {
          return api(originalRequest);
        })
        .catch(err => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // El refreshToken ahora se envía automáticamente por cookie
        await axios.post(`${api.defaults.baseURL}/auth/refresh`, {}, { withCredentials: true });
        
        processQueue(null);
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError);
        // IMPORTANTE: No usar window.location.href ya que causa recarga total y bucles
        // El AuthContext o ProtectedRoute se encargarán de redirigir si el usuario es null
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // No mostrar toast de error para fallos de sesión o refresco (evita spam visual)
    const isAuthPath = originalRequest.url?.includes('/auth/me') || originalRequest.url?.includes('/auth/refresh');
    if (error.response?.status === 401 && isAuthPath) {
        return Promise.reject(error);
    }

    const message = (error.response?.data as any)?.error || 'Error en la comunicación con el servidor.';
    if (!originalRequest.url?.includes('/auth/refresh')) {
        toast.error(message);
    }
    
    return Promise.reject(error);
  }
);

export const authService = {
  login: (credentials: any) => api.post('/auth/login', credentials),
  refresh: () => api.post('/auth/refresh'),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me')
};

export const usuarioService = {
  getUsuarios: () => api.get<Usuario[]>('/usuarios'),
  getUsuario: (id: number) => api.get<Usuario>(`/usuarios/${id}`),
  crearUsuario: (data: CreateUsuarioDTO) => api.post<Usuario>('/usuarios', sanitize(data)),
  actualizarUsuario: (id: number, data: Partial<CreateUsuarioDTO>) => 
    api.put<Usuario>(`/usuarios/${id}`, sanitize(data)),
  eliminarUsuario: (id: number) => api.delete(`/usuarios/${id}`),
  cambiarRol: (id: number, rol: string) => api.put(`/usuarios/${id}/rol`, { rol }),
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
