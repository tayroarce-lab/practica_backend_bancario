export interface Usuario {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  telefono?: string;
  dui?: string;
  fechaNacimiento?: string;
  password?: string;
  activo?: boolean;
  rol?: 'admin' | 'empleado' | 'cliente';
  createdAt?: string;
}

export interface TipoCuenta {
  id: number;
  nombre: string;
}

export interface Cuenta {
  id: number;
  numeroCuenta: string;
  saldo: number | string;
  estado: 'activa' | 'bloqueada' | 'inactiva';
  usuarioId: number;
  tipoCuentaId: number;
  tipoCuenta?: TipoCuenta;
  usuario?: Usuario;
}

export interface Transaccion {
  id: number;
  monto: number | string;
  tipo: 'deposito' | 'retiro' | 'transferencia';
  descripcion?: string;
  cuentaOrigenId?: number;
  cuentaDestinoId?: number;
  saldoAnterior?: number;
  saldoPosterior?: number;
  createdAt: string;
}

export interface Prestamo {
  id: number;
  monto: number | string;
  plazoMeses: number;
  tasaInteres: number;
  cuotaMensual: number | string;
  estado: 'pendiente' | 'aprobado' | 'rechazado';
  usuarioId: number;
  usuario?: Usuario;
  cuentaDesembolsoId?: number;
}

// Request Types (DTOs)
export interface CreateUsuarioDTO {
  nombre: string;
  apellido: string;
  email: string;
  telefono?: string;
  password?: string;
  dui?: string;
  fechaNacimiento?: string;
  rol?: 'admin' | 'empleado' | 'cliente';
}

export interface CreateCuentaDTO {
  usuarioId: number;
  tipoCuentaId: number;
  saldoInicial?: number;
}

export interface CreateTransferenciaDTO {
  cuentaOrigenId: number;
  cuentaDestinoId: number;
  monto: number;
  descripcion?: string;
}

export interface CreatePrestamoDTO {
  usuarioId: number;
  monto: number;
  plazoMeses: number;
  tasaInteres: number;
}
