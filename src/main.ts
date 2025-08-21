import { bootstrapApplication } from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';
import { importProvidersFrom } from '@angular/core';
import { RouterOutlet, provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialogModule } from '@angular/material/dialog';

import { AppComponent } from './app/app.component';
import { appRoutes } from './app/app.routes';
import { httpErrorInterceptor } from './app/core/interceptors/http-error.interceptor';

/**
 * Punto de arranque de la aplicación.
 * - Arranca app standalone (sin NgModules).
 * - Registra Router, Animations y HttpClient con interceptores globales.
 * Decisión: centralizar proveedores aquí reduce acoplamiento y hace el arranque explícito.
 */
bootstrapApplication(AppComponent, {
  // Registramos interceptores globales:
// - httpErrorInterceptor: traduce HttpErrorResponse a mensajes amigables.
// - (opcional) httpLoggerInterceptor: deja trazas de cada request en consola para demo. 
  providers: [
    provideRouter(appRoutes),
    provideAnimations(),
    provideHttpClient(withInterceptors([httpErrorInterceptor])),
    importProvidersFrom(MatSnackBarModule, MatDialogModule),
  ],
})
  .catch((err) => console.error(err));