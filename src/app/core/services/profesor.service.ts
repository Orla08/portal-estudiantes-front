import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../utils/api-response.model';
import { Profesor } from '../models/materia.model';

export interface CrearProfesorRequest {
  nombre: string;
}

@Injectable({ providedIn: 'root' })
export class ProfesorService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/profesores`;

  getAll(): Observable<ApiResponse<Profesor[]>> {
    return this.http.get<ApiResponse<Profesor[]>>(this.base);
  }

  create(request: CrearProfesorRequest): Observable<ApiResponse<{ profesorId: number }>> {
    return this.http.post<ApiResponse<{ profesorId: number }>>(this.base, request);
  }

  update(id: number, request: CrearProfesorRequest): Observable<ApiResponse<void>> {
    return this.http.put<ApiResponse<void>>(`${this.base}/${id}`, request);
  }
}
