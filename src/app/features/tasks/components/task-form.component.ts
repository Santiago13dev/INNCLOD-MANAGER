import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { Task } from '../services/tasks.api';

// Renderiza un formulario **reactivo** con:
// title: string` (requerido)
// completed: boolean` (checkbox)
// Si recibe una tarea por `@Input task`, **precarga** el formulario (modo edición).
// No conoce rutas ni HTTP: al guardar **emite** los datos al padre y el padre decide
// si crea/actualiza en el servicio correspondiente.
// Muestra **validaciones** (`mat-error`) y controles accesibles (labels/aria).

@Component({
  selector: 'app-task-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatCheckboxModule, MatButtonModule],
  template: `
    <form [formGroup]="form" (ngSubmit)="onSubmit()" class="task-form">
      <mat-form-field appearance="fill">
        <mat-label>Title</mat-label>
        <input matInput formControlName="title" required />
        <mat-error *ngIf="form.controls['title'].touched && form.controls['title'].invalid">
          Title is required
        </mat-error>
      </mat-form-field>
      <mat-checkbox formControlName="completed">Completed</mat-checkbox>
      <div class="actions">
        <button mat-raised-button color="primary" type="submit" [disabled]="form.invalid">Save</button>
        <button mat-button type="button" (click)="onCancel()">Cancel</button>
      </div>
    </form>
  `,
  styles: [
    `
      .task-form {
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }
      .actions {
        display: flex;
        gap: 0.5rem;
      }
    `,
  ],
})
export class TaskFormComponent implements OnChanges {
  @Input() task?: Task | null;
  @Output() save = new EventEmitter<Partial<Task>>();
  @Output() cancel = new EventEmitter<void>();

  form: FormGroup;

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      title: ['', [Validators.required]],
      completed: [false],
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['task'] && this.task) {
      this.form.patchValue({ title: this.task.title, completed: this.task.completed });
    } else if (changes['task'] && !this.task) {
      this.form.reset({ title: '', completed: false });
    }
  }

  onSubmit(): void {
    if (this.form.invalid) {
      return;
    }
    this.save.emit(this.form.value);
    this.form.reset({ title: '', completed: false });
  }

  onCancel(): void {
    this.cancel.emit();
    this.form.reset({ title: '', completed: false });
  }
}