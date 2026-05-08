import { TestBed } from '@angular/core/testing';
import { provideRouter, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { adminGuard } from './admin.guard';
import { AuthService } from '../services/auth.service';

// ─── helpers ────────────────────────────────────────────────────────────────

function buildAuthServiceMock(isAdmin: boolean): Partial<AuthService> {
  return {
    isAdmin: jasmine.createSpy('isAdmin').and.returnValue(isAdmin),
  };
}

const dummyRoute = {} as ActivatedRouteSnapshot;
const dummyState = {} as RouterStateSnapshot;

// ─── suite ──────────────────────────────────────────────────────────────────

describe('adminGuard', () => {
  let router: Router;

  // ── Usuario administrador ──────────────────────────────────────────────────

  describe('cuando el usuario ES administrador', () => {
    beforeEach(() => {
      TestBed.configureTestingModule({
        providers: [
          provideRouter([]),
          { provide: AuthService, useValue: buildAuthServiceMock(true) },
        ],
      });
      router = TestBed.inject(Router);
    });

    it('debería permitir el acceso retornando true', () => {
      const result = TestBed.runInInjectionContext(() =>
        adminGuard(dummyRoute, dummyState)
      );
      expect(result).toBeTrue();
    });

    it('NO debería navegar a /inicio', () => {
      spyOn(router, 'navigate');
      TestBed.runInInjectionContext(() => adminGuard(dummyRoute, dummyState));
      expect(router.navigate).not.toHaveBeenCalled();
    });
  });

  // ── Usuario NO administrador ───────────────────────────────────────────────

  describe('cuando el usuario NO es administrador', () => {
    beforeEach(() => {
      TestBed.configureTestingModule({
        providers: [
          provideRouter([]),
          { provide: AuthService, useValue: buildAuthServiceMock(false) },
        ],
      });
      router = TestBed.inject(Router);
    });

    it('debería bloquear el acceso retornando false', () => {
      const result = TestBed.runInInjectionContext(() =>
        adminGuard(dummyRoute, dummyState)
      );
      expect(result).toBeFalse();
    });

    it('debería navegar a /inicio', () => {
      spyOn(router, 'navigate');
      TestBed.runInInjectionContext(() => adminGuard(dummyRoute, dummyState));
      expect(router.navigate).toHaveBeenCalledWith(['/inicio']);
    });
  });
});
