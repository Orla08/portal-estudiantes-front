import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../utils/api-response.model';
import { Inscripcion, CompaneroMateria, InscripcionRequest } from '../models/inscripcion.model';

@Injectable({ providedIn: 'root' })
export class InscripcionService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/estudiantes`;

  getMiInscripcion(estudianteId: number): Observable<ApiResponse<Inscripcion[]>> {
    return this.http.get<ApiResponse<Inscripcion[]>>(`${this.base}/${estudianteId}/inscripcion`);
  }

  getCompaneros(estudianteId: number): Observable<ApiResponse<CompaneroMateria[]>> {
    return this.http.get<ApiResponse<CompaneroMateria[]>>(`${this.base}/${estudianteId}/companeros`);
  }

  registrar(estudianteId: number, request: InscripcionRequest): Observable<ApiResponse<void>> {
    return this.http.post<ApiResponse<void>>(`${this.base}/${estudianteId}/inscripcion`, request);
  }

  cancelar(estudianteId: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.base}/${estudianteId}/inscripcion`);
  }

  cancelarPorMateria(estudianteId: number, materiaId: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.base}/${estudianteId}/inscripcion/${materiaId}`);
  }
}
