import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

let isRefreshing = false;

export const authInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const token = authService.getToken();
  const authReq = token ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : req;

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && !req.url.includes('/auth/') && authService.isAuthenticated() && !isRefreshing) {
        isRefreshing = true;
        return authService.refreshToken().pipe(
          switchMap(res => {
            isRefreshing = false;
            if (res.success && res.data) {
              const retryReq = req.clone({ setHeaders: { Authorization: `Bearer ${res.data.accessToken}` } });
              return next(retryReq);
            }
            authService.logout();
            router.navigate(['/login']);
            return throwError(() => error);
          }),
          catchError(() => {
            isRefreshing = false;
            authService.logout();
            router.navigate(['/login']);
            return throwError(() => error);
          })
        );
      }
      return throwError(() => error);
    })
  );
};
