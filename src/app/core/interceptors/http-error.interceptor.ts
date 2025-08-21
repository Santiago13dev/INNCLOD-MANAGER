/**
 * Interceptor de errores HTTP.
 * - Captura HttpErrorResponse y notifica al usuario con mensajes claros.
 * - No rompe el flujo: deja que el componente maneje 'error' en su estado.
 * Decisión: manejo centralizado → componentes limpios y consistencia de UX.
 */

import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { NotificationService } from '../services/notification.service';

// 0 → error de red (offline/bloqueado/CORS), 4xx → cliente/autorización, 5xx → servidor.

export const httpErrorInterceptor: HttpInterceptorFn = (req, next) => {
  const notification = inject(NotificationService);
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      const message = error.error?.message || error.message || 'Unexpected error occurred';
      notification.showError(message);
      return throwError(() => error);
    }),
  );
};