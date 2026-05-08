export interface Inscripcion {
  estudianteId: number;
  materiaId: number;
  nombreMateria: string;
  nombreProfesor: string;
  creditos: number;
  fechaRegistro: string;
  estado: boolean;
}

export interface CompaneroMateria {
  nombreMateria: string;
  nombreCompanero: string;
}

export interface InscripcionRequest {
  materiaIds: number[];
}
