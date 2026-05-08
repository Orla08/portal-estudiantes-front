export interface Materia {
  materiaId: number;
  nombre: string;
  creditos: number;
  profesorId: number;
  nombreProfesor: string;
  programaCreditoId: number;
  estado: boolean;
}

export interface Profesor {
  profesorId: number;
  nombre: string;
  estado: boolean;
}

export interface ProgramaCredito {
  programaCreditoId: number;
  nombre: string;
  creditosPorMateria: number;
  maxMateriasPorEstudiante: number;
  estado: boolean;
}
