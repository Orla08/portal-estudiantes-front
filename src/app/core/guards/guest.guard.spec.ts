import { TestBed } from '@angular/core/testing';
import { provideRouter, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { guestGuard } from './guest.guard';
import { AuthService } from '../services/auth.service';

// ─── helpers ────────────────────────────────────────────────────────────────

function buildAuthServiceMock(isAuthenticated: boolean): any {
  return {
    isAuthenticated: jasmine.createSpy('isAuthenticated').and.returnValue(isAuthenticated),
  };
}

const dummyRoute = {} as ActivatedRouteSnapshot;
const dummyState = {} as RouterStateSnapshot;

// ─── suite ──────────────────────────────────────────────────────────────────

describe('guestGuard', () => {
  let router: Router;

  // ── Usuario NO autenticado (invitado) ──────────────────────────────────────

  describe('cuando el usuario NO está autenticado (invitado)', () => {
    beforeEach(() => {
      TestBed.configureTestingModule({
        providers: [
          provideRouter([]),
          { provide: AuthService, useValue: buildAuthServiceMock(false) },
        ],
      });
      router = TestBed.inject(Router);
    });

    it('debería permitir el acceso retornando true', () => {
      const result = TestBed.runInInjectionContext(() =>
        guestGuard(dummyRoute, dummyState)
      );
      expect(result).toBeTrue();
    });

    it('NO debería navegar a /inicio', () => {
      spyOn(router, 'navigate');
      TestBed.runInInjectionContext(() => guestGuard(dummyRoute, dummyState));
      expect(router.navigate).not.toHaveBeenCalled();
    });
  });

  // ── Usuario YA autenticado ─────────────────────────────────────────────────

  describe('cuando el usuario YA está autenticado', () => {
    beforeEach(() => {
      TestBed.configureTestingModule({
        providers: [
          provideRouter([]),
          { provide: AuthService, useValue: buildAuthServiceMock(true) },
        ],
      });
      router = TestBed.inject(Router);
    });

    it('debería bloquear el acceso retornando false', () => {
      const result = TestBed.runInInjectionContext(() =>
        guestGuard(dummyRoute, dummyState)
      );
      expect(result).toBeFalse();
    });

    it('debería navegar a /inicio', () => {
      spyOn(router, 'navigate');
      TestBed.runInInjectionContext(() => guestGuard(dummyRoute, dummyState));
      expect(router.navigate).toHaveBeenCalledWith(['/inicio']);
    });
  });
});
