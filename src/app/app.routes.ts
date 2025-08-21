/**
 * Mapa de rutas principal.
 * - Login público.
// - /projects y /projects/:id/tasks protegidas con authGuard.
// - loadComponent: lazy para cada página → mejor tiempo de carga inicial.
 * Decisión: usamos standalone + lazy por simplicidad y rendimiento.
 */
import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
// canActivate: authGuard redirige a /login si no hay sesión en localStorage.
export const appRoutes: Routes = [
  { path: 'login', loadComponent: () => import('./auth/pages/login.page').then(m => m.LoginPage) },
  { path: 'projects', canActivate: [authGuard],
    loadComponent: () => import('./features/projects/pages/projects.page').then(m => m.ProjectsPage) },
  { path: 'projects/:id/tasks', canActivate: [authGuard],
    loadComponent: () => import('./features/tasks/pages/tasks.page').then(m => m.TasksPage) },
  { path: '', pathMatch: 'full', redirectTo: 'login' },
  { path: '**', redirectTo: 'login' },
];
