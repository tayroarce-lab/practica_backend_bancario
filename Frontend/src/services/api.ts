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

// Interceptor para añadir el token JWT
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
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
        .then(token => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        })
        .catch(err => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        // No hay refresh token, forzar logout
        localStorage.clear();
        window.location.href = '/login';
        return Promise.reject(error);
      }

      try {
        const res = await axios.post(`${api.defaults.baseURL}/auth/refresh`, { refreshToken });
        const { accessToken, refreshToken: newRefreshToken } = res.data;

        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', newRefreshToken);

        api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
        processQueue(null, accessToken);
        
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        localStorage.clear();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
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
  refresh: (refreshToken: string) => api.post('/auth/refresh', { refreshToken }),
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
