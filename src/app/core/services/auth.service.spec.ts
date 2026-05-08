import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';
import { LoginResponse } from '../models/auth.model';
import { environment } from '../../../environments/environment';

// ─── helpers ────────────────────────────────────────────────────────────────

const LOGIN_URL  = `${environment.apiUrl}/auth/login`;
const REFRESH_URL = `${environment.apiUrl}/auth/refresh`;
const LOGOUT_URL  = `${environment.apiUrl}/auth/logout`;

const mockLoginData: LoginResponse = {
  accessToken:  'access-token-123',
  refreshToken: 'refresh-token-abc',
  expiration:   '2026-12-31T00:00:00Z',
  nombreUsuario: 'testuser',
  rol:          'Estudiante',
  estudianteId: 1000,
};

const mockAdminData: LoginResponse = {
  ...mockLoginData,
  nombreUsuario: 'admin',
  rol:          'Administrador',
  estudianteId: undefined,
};

// ─── suite ──────────────────────────────────────────────────────────────────

describe('AuthService', () => {
  let service:  AuthService;
  let httpMock: HttpTestingController;
  let router:   Router;

  // Cada test parte de localStorage limpio → service sin sesión
  beforeEach(() => {
    localStorage.clear();

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
      ],
    });

    service  = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    router   = TestBed.inject(Router);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  // ── Creación ───────────────────────────────────────────────────────────────

  it('debería crearse correctamente', () => {
    expect(service).toBeTruthy();
  });

  // ── Signals: estado inicial (sin sesión) ───────────────────────────────────

  it('isAuthenticated debería ser false cuando no hay token guardado', () => {
    expect(service.isAuthenticated()).toBeFalse();
  });

  it('isAdmin debería ser false cuando no hay sesión', () => {
    expect(service.isAdmin()).toBeFalse();
  });

  it('getToken() debería retornar null cuando no hay sesión', () => {
    expect(service.getToken()).toBeNull();
  });

  it('rol() debería retornar null cuando no hay sesión', () => {
    expect(service.rol()).toBeNull();
  });

  it('estudianteId() debería retornar null cuando no hay sesión', () => {
    expect(service.estudianteId()).toBeNull();
  });

  // ── Signals: estado inicial (con localStorage pre-cargado) ─────────────────

  it('isAuthenticated debería ser true cuando ya hay token en localStorage', () => {
    localStorage.setItem('accessToken', 'persisted-token');
    // Recrear el servicio para que lea el localStorage
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
      ],
    });
    const freshService = TestBed.inject(AuthService);
    expect(freshService.isAuthenticated()).toBeTrue();
  });

  it('isAdmin debería ser true cuando localStorage tiene rol Administrador', () => {
    localStorage.setItem('accessToken', 'token');
    localStorage.setItem('rol', 'Administrador');
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
      ],
    });
    const freshService = TestBed.inject(AuthService);
    expect(freshService.isAdmin()).toBeTrue();
  });

  // ── login() ────────────────────────────────────────────────────────────────

  it('login() debería hacer POST a la URL correcta', () => {
    service.login({ nombreUsuario: 'test', contrasena: '123456' }).subscribe();

    const req = httpMock.expectOne(LOGIN_URL);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ nombreUsuario: 'test', contrasena: '123456' });
    req.flush({ success: true, data: mockLoginData });
  });

  it('login() debería actualizar los signals y localStorage cuando success=true', () => {
    service.login({ nombreUsuario: 'testuser', contrasena: '123456' }).subscribe(res => {
      expect(res.success).toBeTrue();
    });
    httpMock.expectOne(LOGIN_URL).flush({ success: true, data: mockLoginData });

    expect(service.isAuthenticated()).toBeTrue();
    expect(service.getToken()).toBe('access-token-123');
    expect(service.rol()).toBe('Estudiante');
    expect(service.nombreUsuario()).toBe('testuser');
    expect(service.estudianteId()).toBe(1000);
    expect(localStorage.getItem('accessToken')).toBe('access-token-123');
    expect(localStorage.getItem('refreshToken')).toBe('refresh-token-abc');
  });

  it('login() con rol Administrador debería marcar isAdmin como true', () => {
    service.login({ nombreUsuario: 'admin', contrasena: 'Admin123!' }).subscribe();
    httpMock.expectOne(LOGIN_URL).flush({ success: true, data: mockAdminData });

    expect(service.isAdmin()).toBeTrue();
  });

  it('login() NO debería guardar sesión cuando success=false', () => {
    service.login({ nombreUsuario: 'bad', contrasena: 'bad' }).subscribe();
    httpMock.expectOne(LOGIN_URL).flush({
      success: false,
      error: { code: 'CREDENCIALES_INVALIDAS', message: 'Credenciales incorrectas' },
    });

    expect(service.isAuthenticated()).toBeFalse();
    expect(localStorage.getItem('accessToken')).toBeNull();
  });

  // ── logout() ───────────────────────────────────────────────────────────────

  it('logout() debería limpiar signals y localStorage', () => {
    // Establecer sesión primero
    service.login({ nombreUsuario: 'testuser', contrasena: '123' }).subscribe();
    httpMock.expectOne(LOGIN_URL).flush({ success: true, data: mockLoginData });
    expect(service.isAuthenticated()).toBeTrue();

    service.logout();
    httpMock.match(LOGOUT_URL).forEach(r => r.flush({}));

    expect(service.isAuthenticated()).toBeFalse();
    expect(service.getToken()).toBeNull();
    expect(service.rol()).toBeNull();
    expect(service.estudianteId()).toBeNull();
    expect(localStorage.getItem('accessToken')).toBeNull();
  });

  it('logout() debería navegar a /login', () => {
    spyOn(router, 'navigate');

    service.logout();
    httpMock.match(LOGOUT_URL).forEach(r => r.flush({}));

    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });

  // ── refreshToken() ─────────────────────────────────────────────────────────

  it('refreshToken() debería hacer POST a la URL correcta', () => {
    service.refreshToken().subscribe();

    const req = httpMock.expectOne(REFRESH_URL);
    expect(req.request.method).toBe('POST');
    req.flush({ success: true, data: mockLoginData });
  });

  it('refreshToken() debería actualizar el accessToken cuando success=true', () => {
    const newData = { ...mockLoginData, accessToken: 'new-access-token' };

    service.refreshToken().subscribe();
    httpMock.expectOne(REFRESH_URL).flush({ success: true, data: newData });

    expect(service.getToken()).toBe('new-access-token');
    expect(localStorage.getItem('accessToken')).toBe('new-access-token');
  });

  // ── setEstudianteId() ──────────────────────────────────────────────────────

  it('setEstudianteId() debería actualizar el signal y localStorage', () => {
    service.setEstudianteId(1500);

    expect(service.estudianteId()).toBe(1500);
    expect(localStorage.getItem('estudianteId')).toBe('1500');
  });

  it('setEstudianteId() debería sobrescribir un ID previo', () => {
    service.setEstudianteId(1000);
    service.setEstudianteId(2000);

    expect(service.estudianteId()).toBe(2000);
    expect(localStorage.getItem('estudianteId')).toBe('2000');
  });
});
