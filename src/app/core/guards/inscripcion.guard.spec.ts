import { TestBed } from '@angular/core/testing';
import { provideRouter, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { inscripcionGuard } from './inscripcion.guard';
import { AuthService } from '../services/auth.service';

// ─── helpers ────────────────────────────────────────────────────────────────

function buildAuthServiceMock(isAuthenticated: boolean, isAdmin: boolean): any {
  return {
    isAuthenticated: jasmine.createSpy('isAuthenticated').and.returnValue(isAuthenticated),
    isAdmin:         jasmine.createSpy('isAdmin').and.returnValue(isAdmin),
  };
}

const dummyRoute = {} as ActivatedRouteSnapshot;
const dummyState = {} as RouterStateSnapshot;

// ─── suite ──────────────────────────────────────────────────────────────────

describe('inscripcionGuard', () => {
  let router: Router;

  // ── Estudiante autenticado (no admin) ──────────────────────────────────────

  describe('cuando el usuario está autenticado y NO es admin (Estudiante)', () => {
    beforeEach(() => {
      TestBed.configureTestingModule({
        providers: [
          provideRouter([]),
          { provide: AuthService, useValue: buildAuthServiceMock(true, false) },
        ],
      });
      router = TestBed.inject(Router);
    });

    it('debería permitir el acceso retornando true', () => {
      const result = TestBed.runInInjectionContext(() =>
        inscripcionGuard(dummyRoute, dummyState)
      );
      expect(result).toBeTrue();
    });

    it('NO debería navegar a /inicio', () => {
      spyOn(router, 'navigate');
      TestBed.runInInjectionContext(() => inscripcionGuard(dummyRoute, dummyState));
      expect(router.navigate).not.toHaveBeenCalled();
    });
  });

  // ── Usuario administrador ──────────────────────────────────────────────────

  describe('cuando el usuario está autenticado y ES admin', () => {
    beforeEach(() => {
      TestBed.configureTestingModule({
        providers: [
          provideRouter([]),
          { provide: AuthService, useValue: buildAuthServiceMock(true, true) },
        ],
      });
      router = TestBed.inject(Router);
    });

    it('debería bloquear el acceso retornando false', () => {
      const result = TestBed.runInInjectionContext(() =>
        inscripcionGuard(dummyRoute, dummyState)
      );
      expect(result).toBeFalse();
    });

    it('debería navegar a /inicio', () => {
      spyOn(router, 'navigate');
      TestBed.runInInjectionContext(() => inscripcionGuard(dummyRoute, dummyState));
      expect(router.navigate).toHaveBeenCalledWith(['/inicio']);
    });
  });

  // ── Usuario NO autenticado ─────────────────────────────────────────────────

  describe('cuando el usuario NO está autenticado', () => {
    beforeEach(() => {
      TestBed.configureTestingModule({
        providers: [
          provideRouter([]),
          { provide: AuthService, useValue: buildAuthServiceMock(false, false) },
        ],
      });
      router = TestBed.inject(Router);
    });

    it('debería bloquear el acceso retornando false', () => {
      const result = TestBed.runInInjectionContext(() =>
        inscripcionGuard(dummyRoute, dummyState)
      );
      expect(result).toBeFalse();
    });

    it('debería navegar a /inicio', () => {
      spyOn(router, 'navigate');
      TestBed.runInInjectionContext(() => inscripcionGuard(dummyRoute, dummyState));
      expect(router.navigate).toHaveBeenCalledWith(['/inicio']);
    });
  });
});
