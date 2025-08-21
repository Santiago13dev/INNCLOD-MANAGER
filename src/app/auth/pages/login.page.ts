import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';

/**
 * Pantalla de Login (formulario reactivo).
 * - Valida email y password (dummy).
 * - Al enviar: guarda sesión y redirige a /projects.
 * Decisión: usar reactive forms por claridad, validaciones y escalabilidad.
 */
@Component({
  selector: 'app-login-page',
  standalone: true,
  template: `
    <mat-card class="login-card">
      <h2>Login</h2>
      <form [formGroup]="form" (ngSubmit)="onSubmit()" novalidate>
        <mat-form-field appearance="fill" class="full-width">
          <mat-label>Email</mat-label>
          <input matInput type="email" formControlName="email" required />
          <mat-error *ngIf="form.controls['email'].touched && form.controls['email'].invalid">
            Please enter a valid email
          </mat-error>
        </mat-form-field>

        <mat-form-field appearance="fill" class="full-width">
          <mat-label>Password</mat-label>
          <input matInput [type]="hidePassword ? 'password' : 'text'" formControlName="password" required />
          <button
            type="button"
            mat-icon-button
            matSuffix
            (click)="hidePassword = !hidePassword"
            [attr.aria-label]="hidePassword ? 'Show password' : 'Hide password'">
            <mat-icon>{{ hidePassword ? 'visibility_off' : 'visibility' }}</mat-icon>
          </button>
          <mat-error *ngIf="form.controls['password'].touched && form.controls['password'].invalid">
            Password is required
          </mat-error>
        </mat-form-field>

        <div class="actions">
          <button mat-raised-button color="primary" type="submit" [disabled]="form.invalid">Login</button>
        </div>
      </form>
    </mat-card>
  `,
  styles: [
    `
      .login-card {
        max-width: 400px;
        margin: 2rem auto;
        padding: 2rem;
      }
      .full-width {
        width: 100%;
      }
      .actions {
        margin-top: 1rem;
        text-align: center;
      }
    `,
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
  ],
})
export class LoginPage {
  form: FormGroup;
  hidePassword = true;

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router,
    private notification: NotificationService,
  ) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
    });
  }

  // Notificamos éxito y navegamos; el guard habilita el resto de rutas.

  onSubmit(): void {
  if (this.form.invalid) { this.notification.showError('Please complete the form correctly'); return; }
  const { email, password } = this.form.value;
  this.auth.login(email as string, password as string);
  this.notification.showSuccess('Login successful');
  this.router.navigate(['/projects']); // redirige a la vista principal
  }
}
