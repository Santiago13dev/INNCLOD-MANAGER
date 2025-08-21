/**
 * Guard de ruta: bloquea el acceso si no hay sesión.
 * Retorna UrlTree a /login (mejor UX que devolver false puro).
 * Decisión: la autorización por roles NO es requisito; solo verificación de sesión.
 */

import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  return auth.isLoggedIn() ? true : router.createUrlTree(['/login']);
};
