export interface LoginRequest {
  nombreUsuario: string;
  contrasena: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  expiration: string;
  nombreUsuario: string;
  rol: string;
  estudianteId?: number;
}

export interface RegistroRequest {
  nombreUsuario: string;
  email: string;
  contrasena: string;
  nombre: string;
  programaCreditoId: number;
}
