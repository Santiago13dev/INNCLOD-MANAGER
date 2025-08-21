import { Component, Inject, ChangeDetectionStrategy } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

export interface ConfirmDialogData {
  title?: string;
  message?: string;
  confirmLabel?: string;             
  cancelLabel?: string;              
  confirmColor?: 'primary' | 'accent' | 'warn'; 
}

/**
 * Diálogo de confirmación genérico.
 * - cdkFocusInitial en Cancel: previene acciones destructivas accidentales.
 * - Labels y color configurables vía data.
 * Decisión: componente compartido para borrar en Projects/Tasks con la misma UX.
 */

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatDialogModule, MatButtonModule],
  template: `
    <h2 mat-dialog-title id="confirm-title">{{ data?.title || 'Confirm' }}</h2>

    <div mat-dialog-content>
      <p>{{ data?.message || 'Are you sure you want to proceed?' }}</p>
    </div>

    <div mat-dialog-actions align="end">
      <!-- Foco inicial en "Cancel" para evitar acciones destructivas accidentales -->
      <button mat-button type="button" cdkFocusInitial (click)="onCancel()">
        {{ data?.cancelLabel || 'Cancel' }}
      </button>
      <button
        mat-raised-button
        type="button"
        [color]="data?.confirmColor || 'warn'"
        (click)="onConfirm()"
        aria-label="Confirm action"
      >
        {{ data?.confirmLabel || 'Delete' }}
      </button>
    </div>
  `,
})
export class ConfirmDialogComponent {
  constructor(
    private dialogRef: MatDialogRef<ConfirmDialogComponent, boolean>,
    @Inject(MAT_DIALOG_DATA) public data: ConfirmDialogData | null,
  ) {}

  onConfirm(): void {
    this.dialogRef.close(true);
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}
