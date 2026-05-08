import { inject, Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../utils/api-response.model';
import { LoginRequest, LoginResponse, RegistroRequest } from '../models/auth.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  private readonly _token = signal<string | null>(localStorage.getItem('accessToken'));
  private readonly _refreshToken = signal<string | null>(localStorage.getItem('refreshToken'));
  private readonly _nombreUsuario = signal<string | null>(localStorage.getItem('nombreUsuario'));
  private readonly _rol = signal<string | null>(localStorage.getItem('rol'));
  private readonly _estudianteId = signal<number | null>(
    localStorage.getItem('estudianteId') ? Number(localStorage.getItem('estudianteId')) : null
  );

  readonly isAuthenticated = computed(() => !!this._token());
  readonly rol = computed(() => this._rol());
  readonly nombreUsuario = computed(() => this._nombreUsuario());
  readonly estudianteId = computed(() => this._estudianteId());
  readonly isAdmin = computed(() => this._rol() === 'Administrador');

  login(request: LoginRequest): Observable<ApiResponse<LoginResponse>> {
    return this.http.post<ApiResponse<LoginResponse>>(`${environment.apiUrl}/auth/login`, request).pipe(
      tap(res => {
        if (res.success && res.data) this.guardarSesion(res.data);
      })
    );
  }

  registro(request: RegistroRequest): Observable<ApiResponse<{ estudianteId: number }>> {
    return this.http.post<ApiResponse<{ estudianteId: number }>>(`${environment.apiUrl}/auth/registro`, request);
  }

  refreshToken(): Observable<ApiResponse<LoginResponse>> {
    const token = this._refreshToken();
    return this.http.post<ApiResponse<LoginResponse>>(`${environment.apiUrl}/auth/refresh`, { refreshToken: token }).pipe(
      tap(res => {
        if (res.success && res.data) this.guardarSesion(res.data);
      })
    );
  }

  logout(): void {
    const token = this._refreshToken();
    if (token) {
      this.http.post(`${environment.apiUrl}/auth/logout`, { refreshToken: token }).subscribe({
        error: () => {}
      });
    }
    this.limpiarSesion();
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return this._token();
  }

  setEstudianteId(id: number): void {
    this._estudianteId.set(id);
    localStorage.setItem('estudianteId', String(id));
  }

  private guardarSesion(data: LoginResponse): void {
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
    localStorage.setItem('nombreUsuario', data.nombreUsuario);
    localStorage.setItem('rol', data.rol);
    this._token.set(data.accessToken);
    this._refreshToken.set(data.refreshToken);
    this._nombreUsuario.set(data.nombreUsuario);
    this._rol.set(data.rol);
    const estId = (data as any).estudianteId ?? null;
    this._estudianteId.set(estId);
    if (estId !== null && estId !== undefined) {
      localStorage.setItem('estudianteId', String(estId));
    }
    console.log('[Auth] guardarSesion data:', data);
    console.log('[Auth] EstudianteId set to:', estId);
  }

  private limpiarSesion(): void {
    localStorage.clear();
    this._token.set(null);
    this._refreshToken.set(null);
    this._nombreUsuario.set(null);
    this._rol.set(null);
    this._estudianteId.set(null);
  }
}
