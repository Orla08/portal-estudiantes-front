import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../utils/api-response.model';
import { Materia } from '../models/materia.model';

export interface CrearMateriaRequest {
  nombre: string;
  creditos: number;
  profesorId: number;
  programaCreditoId: number;
}

@Injectable({ providedIn: 'root' })
export class MateriaService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/materias`;

  getAll(): Observable<ApiResponse<Materia[]>> {
    return this.http.get<ApiResponse<Materia[]>>(this.base);
  }

  getById(id: number): Observable<ApiResponse<Materia>> {
    return this.http.get<ApiResponse<Materia>>(`${this.base}/${id}`);
  }

  create(request: CrearMateriaRequest): Observable<ApiResponse<{ materiaId: number }>> {
    return this.http.post<ApiResponse<{ materiaId: number }>>(this.base, request);
  }

  update(id: number, request: CrearMateriaRequest): Observable<ApiResponse<void>> {
    return this.http.put<ApiResponse<void>>(`${this.base}/${id}`, request);
  }

  delete(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.base}/${id}`);
  }
}
