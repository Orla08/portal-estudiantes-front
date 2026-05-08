export interface Usuario {
  usuarioId: number;
  nombreUsuario: string;
  email: string;
  rol: string;
  fechaRegistro: string;
  estado: boolean;
}

export interface CrearUsuarioRequest {
  nombreUsuario: string;
  email: string;
  contrasena: string;
  rol: string;
}
