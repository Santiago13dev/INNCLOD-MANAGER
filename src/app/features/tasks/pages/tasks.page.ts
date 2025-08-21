import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';

import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

import { TasksApiService, Task } from '../services/tasks.api';
import { NotificationService } from '../../../core/services/notification.service';
import { ConfirmDialogComponent } from '../../../shared/ui/confirm-dialog/confirm-dialog.component';
/**
 * Página de Tasks (por projectId).
 * - Lee :id de la ruta, valida y pide datos al servicio.
 * - Form reactivo con checkbox Completed; CRUD local optimista + confirmación al borrar.
 * Decisión: estructura gemela a Projects para coherencia de UX.
 */
@Component({
  selector: 'app-tasks-page',
  standalone: true,
  imports: [
    CommonModule, RouterLink, ReactiveFormsModule,
    MatListModule, MatIconModule, MatButtonModule, MatCardModule,
    MatCheckboxModule, MatFormFieldModule, MatInputModule, MatDialogModule,
  ],
  template: `
    <section>
      <h2>Tasks for project {{ projectId }}</h2>

      <form [formGroup]="form" (ngSubmit)="save()" class="task-form" novalidate>
        <mat-form-field appearance="fill" class="full-width">
          <mat-label>Title</mat-label>
          <input matInput formControlName="title" required />
          <mat-error *ngIf="form.controls['title'].touched && form.controls['title'].invalid">
            Title is required
          </mat-error>
        </mat-form-field>

        <mat-checkbox formControlName="completed">Completed</mat-checkbox>

        <div class="actions">
          <button mat-raised-button color="primary" type="submit" [disabled]="form.invalid">Save</button>
          <button mat-button type="button" (click)="cancel()">Cancel</button>
          <a mat-button routerLink="/projects">Back to Projects</a>
        </div>
      </form>

      <mat-card *ngIf="error" class="state-card">
        <mat-icon>info</mat-icon>
        {{ error }}
      </mat-card>

      <mat-card *ngIf="loading" class="state-card">
        <mat-icon>hourglass_empty</mat-icon>
        Loading tasks...
      </mat-card>

      <mat-list *ngIf="!loading && !error && tasks.length > 0">
        <mat-list-item *ngFor="let t of tasks">
          <div matListItemTitle [class.done]="t.completed">{{ t.title }}</div>
          <div matListItemLine>Completed: {{ t.completed ? 'Yes' : 'No' }}</div>
          <span matListItemMeta class="item-actions">
            <button mat-icon-button color="primary" (click)="edit(t)" aria-label="Edit task">
              <mat-icon>edit</mat-icon>
            </button>
            <button mat-icon-button color="warn" (click)="remove(t)" aria-label="Delete task">
              <mat-icon>delete</mat-icon>
            </button>
          </span>
        </mat-list-item>
      </mat-list>

      <mat-card *ngIf="!loading && !error && tasks.length === 0" class="state-card">
        <mat-icon>inbox</mat-icon>
        No tasks for this project.
      </mat-card>
    </section>
  `,
  styles: [`
    .task-form { margin-bottom: 1rem; }
    .full-width { width: 100%; }
    .actions { display: flex; flex-wrap: wrap; gap: .5rem; margin-top: .5rem; align-items: center; }
    .state-card { display: flex; gap: .5rem; align-items: center; padding: 1rem; margin-top: 1rem; }
    .item-actions { display: inline-flex; gap: .25rem; align-items: center; }
    .done { text-decoration: line-through; opacity: .8; }
  `]
  
})
// Si el id no es válido, mostramos error en UI y evitamos llamar a la API.

export class TasksPage implements OnInit {
  projectId!: number;
  tasks: Task[] = [];
  loading = false;
  error: string | null = null;

  form: FormGroup;
  editing: Task | null = null;

  constructor(
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private tasksApi: TasksApiService,
    private dialog: MatDialog,
    private notify: NotificationService,
  ) {
    this.form = this.fb.group({
      title: ['', Validators.required],
      completed: [false],
    });
  }

  ngOnInit(): void {
    // Lee el parámetro :id exactamente con ese nombre
    const idParam = this.route.snapshot.paramMap.get('id');
    const id = Number(idParam);

    if (!Number.isFinite(id) || id <= 0) {
      this.error = 'Invalid project id';
      this.tasks = [];
      return;
    }

    this.projectId = id;
    this.error = null;
    this.loadTasks();
  }

  loadTasks(): void {
    this.loading = true;
    this.tasksApi.fetchTasks(this.projectId).subscribe({
      next: (list) => { this.tasks = list; this.loading = false; },
      error: (err) => { this.error = err?.message ?? 'Failed to load tasks'; this.loading = false; },
    });
  }

  edit(t: Task): void {
    this.editing = t;
    this.form.setValue({ title: t.title, completed: t.completed });
  }

  cancel(): void {
    this.editing = null;
    this.form.reset({ title: '', completed: false });
  }

  save(): void {
    if (this.form.invalid) {
      this.notify.showError('Please complete the form correctly');
      return;
    }
    const value = this.form.value;

    if (this.editing) {
      const updated: Task = { ...this.editing, title: value.title, completed: !!value.completed };
      this.tasksApi.updateTask(updated).subscribe(() => {
        this.notify.showSuccess('Task updated');
        this.cancel();
        this.loadTasks();
      });
    } else {
      const payload = { projectId: this.projectId, title: value.title, completed: !!value.completed };
      this.tasksApi.createTask(payload).subscribe(() => {
        this.notify.showSuccess('Task created');
        this.cancel();
        this.loadTasks();
      });
    }
  }

  remove(t: Task): void {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: { title: 'Delete Task', message: `Delete “${t.title}”?` },
    });
    ref.afterClosed().subscribe(ok => {
      if (ok) {
        this.tasksApi.deleteTask(t.id).subscribe(() => {
          this.notify.showSuccess('Task deleted');
          this.loadTasks();
        });
      }
    });
  }
}
