import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../utils/api-response.model';
import { Estudiante, CrearEstudianteRequest, ActualizarEstudianteRequest } from '../models/estudiante.model';

@Injectable({ providedIn: 'root' })
export class EstudianteService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/estudiantes`;

  getAll(): Observable<ApiResponse<Estudiante[]>> {
    return this.http.get<ApiResponse<Estudiante[]>>(this.base);
  }

  getById(id: number): Observable<ApiResponse<Estudiante>> {
    return this.http.get<ApiResponse<Estudiante>>(`${this.base}/${id}`);
  }

  create(request: CrearEstudianteRequest): Observable<ApiResponse<{ estudianteId: number }>> {
    return this.http.post<ApiResponse<{ estudianteId: number }>>(this.base, request);
  }

  update(id: number, request: ActualizarEstudianteRequest): Observable<ApiResponse<void>> {
    return this.http.put<ApiResponse<void>>(`${this.base}/${id}`, request);
  }

  delete(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.base}/${id}`);
  }
}
