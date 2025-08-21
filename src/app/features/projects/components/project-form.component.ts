import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { Project } from '../services/projects.api';
/**
 * Form de Project reutilizable (standalone).
 * - Input project para editar; Output save/cancel para comunicarse con la página.
 * - Campos: name (required), description, active (checkbox).
 * Decisión: separar formulario de la página permite reuso y tests aislados.
 **/
@Component({
  selector: 'app-project-form',
  standalone: true,
  // OnPush: mejora desempeño; el form emite cambios explícitos.
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatCheckboxModule,
  ],
  template: `
    <mat-card class="project-card">
      <form [formGroup]="form" (ngSubmit)="onSubmit()" novalidate>
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Project name</mat-label>
          <input matInput formControlName="name" required />
          <mat-error *ngIf="form.controls['name'].touched && form.controls['name'].invalid">
            Project name is required
          </mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Description</mat-label>
          <textarea matInput formControlName="description" rows="3"></textarea>
        </mat-form-field>

        <mat-checkbox formControlName="active">Active</mat-checkbox>

        <div class="actions">
          <button mat-raised-button color="primary" type="submit" [disabled]="form.invalid">Save</button>
          <button mat-button type="button" (click)="onCancel()">Cancel</button>
        </div>
      </form>
    </mat-card>
  `,
  styles: [`
    .project-card { padding: 1rem; margin: 1rem 0; }
    .full-width { width: 100%; }
    .actions { display: flex; gap: .5rem; margin-top: .5rem; }
  `],
})
export class ProjectFormComponent implements OnChanges {
  @Input() project: Project | null = null;
  @Output() save = new EventEmitter<Partial<Project>>();
  @Output() cancel = new EventEmitter<void>();

  form: FormGroup;

  constructor(private fb: FormBuilder) {
    this.form = this.fb.nonNullable.group({
      name: ['', Validators.required],
      description: [''],
      active: [true],
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['project']) {
      if (this.project) {
        this.form.patchValue({
          name: this.project.name ?? '',
          description: this.project.description ?? '',
          active: this.project.active ?? true,
        });
      } else {
        this.form.reset({ name: '', description: '', active: true });
      }
    }
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    this.save.emit(this.form.value as Partial<Project>);
  }

  onCancel(): void {
    this.form.reset({ name: '', description: '', active: true });
    this.cancel.emit();
  }
}
