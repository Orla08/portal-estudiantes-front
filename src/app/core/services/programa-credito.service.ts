import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../utils/api-response.model';
import { ProgramaCredito } from '../models/materia.model';

export interface CrearProgramaCreditoRequest {
  nombre: string;
  creditosPorMateria: number;
  maxMateriasPorEstudiante: number;
}

@Injectable({ providedIn: 'root' })
export class ProgramaCreditoService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/programas-credito`;

  getAll(): Observable<ApiResponse<ProgramaCredito[]>> {
    return this.http.get<ApiResponse<ProgramaCredito[]>>(this.base);
  }

  create(request: CrearProgramaCreditoRequest): Observable<ApiResponse<{ programaCreditoId: number }>> {
    return this.http.post<ApiResponse<{ programaCreditoId: number }>>(this.base, request);
  }
}
