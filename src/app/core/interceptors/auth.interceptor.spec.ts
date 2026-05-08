import { TestBed } from '@angular/core/testing';
import {
  provideHttpClient,
  withInterceptors,
  HttpClient,
} from '@angular/common/http';
import {
  provideHttpClientTesting,
  HttpTestingController,
} from '@angular/common/http/testing';
import { provideRouter, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { authInterceptor } from './auth.interceptor';
import { AuthService } from '../services/auth.service';

// ─── helpers ────────────────────────────────────────────────────────────────

const TEST_URL        = 'https://api.example.com/data';
const AUTH_URL        = 'https://api.example.com/auth/login';
const MOCK_TOKEN      = 'mock-access-token';
const MOCK_NEW_TOKEN  = 'new-access-token-after-refresh';

function buildAuthServiceMock(overrides: Partial<{
  token: string | null;
  authenticated: boolean;
}> = {}): jasmine.SpyObj<AuthService> {
  const { token = MOCK_TOKEN, authenticated = true } = overrides;

  const mock = jasmine.createSpyObj<AuthService>('AuthService', [
    'getToken',
    'isAuthenticated',
    'refreshToken',
    'logout',
  ]);

  mock.getToken.and.returnValue(token);
  mock.isAuthenticated.and.returnValue(authenticated);
  mock.refreshToken.and.returnValue(
    of({ success: true, data: { accessToken: MOCK_NEW_TOKEN } } as any)
  );
  mock.logout.and.stub();

  return mock;
}

// ─── suite ──────────────────────────────────────────────────────────────────

describe('authInterceptor', () => {
  let http:     HttpClient;
  let httpMock: HttpTestingController;
  let router:   Router;

  function setup(authMock: jasmine.SpyObj<AuthService>): void {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: AuthService, useValue: authMock },
      ],
    });

    http     = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
    router   = TestBed.inject(Router);
  }

  afterEach(() => {
    httpMock.verify();
  });

  // ── Añade cabecera Authorization ───────────────────────────────────────────

  it('debería añadir la cabecera Authorization cuando hay token', () => {
    setup(buildAuthServiceMock());

    http.get(TEST_URL).subscribe();

    const req = httpMock.expectOne(TEST_URL);
    expect(req.request.headers.get('Authorization')).toBe(`Bearer ${MOCK_TOKEN}`);
    req.flush({});
  });

  it('NO debería añadir la cabecera Authorization cuando no hay token', () => {
    setup(buildAuthServiceMock({ token: null }));

    http.get(TEST_URL).subscribe();

    const req = httpMock.expectOne(TEST_URL);
    expect(req.request.headers.has('Authorization')).toBeFalse();
    req.flush({});
  });

  it('debería pasar la solicitud sin modificar si no hay token', () => {
    setup(buildAuthServiceMock({ token: null }));

    http.get(TEST_URL).subscribe();

    const req = httpMock.expectOne(TEST_URL);
    expect(req.request.url).toBe(TEST_URL);
    req.flush({ data: 'ok' });
  });

  // ── Respuestas exitosas ────────────────────────────────────────────────────

  it('debería propagar la respuesta exitosa sin alterarla', () => {
    setup(buildAuthServiceMock());

    let result: any;
    http.get(TEST_URL).subscribe(r => (result = r));

    httpMock.expectOne(TEST_URL).flush({ value: 42 });

    expect(result).toEqual({ value: 42 });
  });

  // ── Error 401 en ruta protegida (no /auth/) ────────────────────────────────

  it('debería llamar refreshToken() al recibir 401 en ruta no-auth', () => {
    const authMock = buildAuthServiceMock();
    setup(authMock);

    http.get(TEST_URL).subscribe({ error: () => {} });

    // Simular 401
    httpMock.expectOne(TEST_URL).flush(
      { message: 'Unauthorized' },
      { status: 401, statusText: 'Unauthorized' }
    );

    // El interceptor reintenta con el nuevo token
    httpMock.expectOne(TEST_URL).flush({ ok: true });

    expect(authMock.refreshToken).toHaveBeenCalled();
  });

  it('después del refresh debería reintentar con el nuevo token', () => {
    const authMock = buildAuthServiceMock();
    setup(authMock);

    http.get(TEST_URL).subscribe({ error: () => {} });

    // Primer intento → 401
    httpMock.expectOne(TEST_URL).flush(
      {},
      { status: 401, statusText: 'Unauthorized' }
    );

    // Reintento con token renovado
    const retryReq = httpMock.expectOne(TEST_URL);
    expect(retryReq.request.headers.get('Authorization')).toBe(`Bearer ${MOCK_NEW_TOKEN}`);
    retryReq.flush({ success: true });
  });

  // ── Error 401 en ruta /auth/ ───────────────────────────────────────────────

  it('NO debería llamar refreshToken() si el 401 viene de /auth/', () => {
    const authMock = buildAuthServiceMock();
    setup(authMock);

    http.get(AUTH_URL).subscribe({ error: () => {} });

    httpMock.expectOne(AUTH_URL).flush(
      {},
      { status: 401, statusText: 'Unauthorized' }
    );

    expect(authMock.refreshToken).not.toHaveBeenCalled();
  });

  // ── Error 401 sin sesión activa ────────────────────────────────────────────

  it('NO debería llamar refreshToken() si el usuario no está autenticado', () => {
    const authMock = buildAuthServiceMock({ authenticated: false });
    setup(authMock);

    http.get(TEST_URL).subscribe({ error: () => {} });

    httpMock.expectOne(TEST_URL).flush(
      {},
      { status: 401, statusText: 'Unauthorized' }
    );

    expect(authMock.refreshToken).not.toHaveBeenCalled();
  });

  // ── Otros códigos de error ─────────────────────────────────────────────────

  it('NO debería llamar refreshToken() ante error 403', () => {
    const authMock = buildAuthServiceMock();
    setup(authMock);

    http.get(TEST_URL).subscribe({ error: () => {} });

    httpMock.expectOne(TEST_URL).flush(
      {},
      { status: 403, statusText: 'Forbidden' }
    );

    expect(authMock.refreshToken).not.toHaveBeenCalled();
  });

  it('NO debería llamar refreshToken() ante error 500', () => {
    const authMock = buildAuthServiceMock();
    setup(authMock);

    http.get(TEST_URL).subscribe({ error: () => {} });

    httpMock.expectOne(TEST_URL).flush(
      {},
      { status: 500, statusText: 'Server Error' }
    );

    expect(authMock.refreshToken).not.toHaveBeenCalled();
  });

  // ── Refresh falla ──────────────────────────────────────────────────────────

  it('debería llamar logout() cuando el refresh falla con error HTTP', () => {
    const authMock = buildAuthServiceMock();
    authMock.refreshToken.and.returnValue(throwError(() => new Error('Refresh error')));
    setup(authMock);
    spyOn(router, 'navigate');

    http.get(TEST_URL).subscribe({ error: () => {} });

    httpMock.expectOne(TEST_URL).flush(
      {},
      { status: 401, statusText: 'Unauthorized' }
    );

    expect(authMock.logout).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('debería llamar logout() cuando el refresh devuelve success=false', () => {
    const authMock = buildAuthServiceMock();
    authMock.refreshToken.and.returnValue(
      of({ success: false, data: null } as any)
    );
    setup(authMock);
    spyOn(router, 'navigate');

    http.get(TEST_URL).subscribe({ error: () => {} });

    httpMock.expectOne(TEST_URL).flush(
      {},
      { status: 401, statusText: 'Unauthorized' }
    );

    expect(authMock.logout).toHaveBeenCalled();
  });
});
