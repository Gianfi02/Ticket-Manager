import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { NotificationService } from '../services/notification.service';

/**
 * Aggiunge il token JWT alle richieste e, se il backend risponde 401
 * (token scaduto o non valido), riporta l'utente al login.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const notification = inject(NotificationService);
  const token = auth.token();
  const isLogin = req.url.endsWith('/auth/login');

  const request = token && !isLogin ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : req;

  return next(request).pipe(
    catchError((err: unknown) => {
      if (err instanceof HttpErrorResponse && err.status === 401 && !isLogin) {
        notification.error('Sessione scaduta: effettua di nuovo il login');
        auth.logout();
      }
      return throwError(() => err);
    }),
  );
};
