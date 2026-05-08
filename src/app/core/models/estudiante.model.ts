export interface Estudiante {
  estudianteId: number;
  nombre: string;
  email: string;
  programaCreditoId: number;
  nombrePrograma: string;
  usuarioId?: number;
  fechaRegistro: string;
  estado: boolean;
}

export interface CrearEstudianteRequest {
  nombre: string;
  email: string;
  programaCreditoId: number;
}

export interface ActualizarEstudianteRequest {
  nombre: string;
  email: string;
  programaCreditoId: number;
}
