import { Injectable, inject } from '@angular/core';
import {
  MatSnackBar,
  MatSnackBarConfig,
  MatSnackBarRef,
  TextOnlySnackBar,
} from '@angular/material/snack-bar';
import { HttpErrorResponse } from '@angular/common/http';

type SnackKind = 'info' | 'success' | 'warn' | 'error';

/**
 * Servicio de notificaciones (snackbar).
 * - API semántica: showInfo/showSuccess/showWarn/showError.
 * - Evita stacking de snackbars (dismiss previo).
 * Decisión: centralizar las notificaciones para mantener tono y duración consistentes.
 */

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly snack = inject(MatSnackBar);
  private ref?: MatSnackBarRef<TextOnlySnackBar>;

  private readonly baseConfig: MatSnackBarConfig = {
    duration: 3000,
    horizontalPosition: 'right',
    verticalPosition: 'bottom',
  };

  private open(
    message: string,
    kind: SnackKind = 'info',
    config?: MatSnackBarConfig,
    action = 'OK',
  ): void {
    // Evita stacking de múltiples snackbars superpuestos
    this.ref?.dismiss();
    const panelClass =
      config?.panelClass ??
      (kind === 'success'
        ? ['snack-success']
        : kind === 'warn'
        ? ['snack-warn']
        : kind === 'error'
        ? ['snack-error']
        : ['snack-info']);

    this.ref = this.snack.open(message, action, {
      ...this.baseConfig,
      ...config,
      panelClass,
    });
  }

  /** Genérico */
  show(message: string, config?: MatSnackBarConfig): void {
    this.open(message, 'info', config);
  }

  
  showInfo(message: string, config?: MatSnackBarConfig): void {
    this.open(message, 'info', config);
  }

  showSuccess(message: string, config?: MatSnackBarConfig): void {
    this.open(message, 'success', config);
  }

  showWarn(message: string, config?: MatSnackBarConfig): void {
    this.open(message, 'warn', config);
  }

  showError(message: string, config?: MatSnackBarConfig): void {
    // Un poco más de tiempo para leer errores
    this.open(message, 'error', { duration: 4000, ...config });
  }

 // Traduce HttpErrorResponse a un mensaje “humano” reutilizable.
  showHttpError(err: unknown, fallback = 'Unexpected error. Please try again.'): void {
    let msg = fallback;

    if (err instanceof HttpErrorResponse) {
      if (err.status === 0) {
        msg = 'Network error: check your internet connection.';
      } else if (err.status >= 500) {
        msg = 'Server error: please try again later.';
      } else if (err.status === 404) {
        msg = 'Resource not found.';
      } else if (err.status === 401 || err.status === 403) {
        msg = 'You are not authorized.';
      } else {
        msg = (err.error as any)?.message ?? err.message ?? fallback;
      }
    }

    this.showError(msg);
  }
}
