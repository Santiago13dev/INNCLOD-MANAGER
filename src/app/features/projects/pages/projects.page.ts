import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ProjectFormComponent } from '../components/project-form.component';
import { ProjectsApiService, Project } from '../services/projects.api';
import { NotificationService } from '../../../core/services/notification.service';
import { ConfirmDialogComponent } from '../../../shared/ui/confirm-dialog/confirm-dialog.component';
import { RouterLink } from '@angular/router';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
/**
 * Página de Projects (lista + CRUD local).
 * - Estados visibles: loading/error/empty.
 * - Acciones: Edit/Delete/Tasks con tooltips y badges (API/LOCAL, Active/Inactive).
 * Decisión: que la UI “cuente” la historia de dónde viene cada dato.
 */
@Component({
  selector: 'app-projects-page',
  standalone: true,
  imports: [
    CommonModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatCardModule,
    MatDialogModule,
    ProjectFormComponent,
    RouterLink,
    MatTooltipModule,
    MatChipsModule,
    MatDividerModule,
  ],
  template: `
<section>
  <h2>Projects</h2>

  <div class="toolbar">
    <button mat-raised-button color="primary" (click)="startCreate()" *ngIf="!showForm">Add Project</button>
  </div>

  <app-project-form
    *ngIf="showForm"
    [project]="editingProject"
    (save)="saveProject($event)"
    (cancel)="cancelEdit()"
  ></app-project-form>

  <div *ngIf="loading" class="state"><mat-icon>hourglass_empty</mat-icon> Loading projects...</div>
  <div *ngIf="error" class="state"><mat-icon>error</mat-icon> {{ error }}</div>

  <div *ngIf="!loading && !error && projects.length === 0" class="card empty">
    <mat-icon>inbox</mat-icon>
    No projects found.
    <button mat-button color="primary" (click)="startCreate()">Create one</button>
  </div>

  <div class="card" *ngIf="projects.length > 0">
    <mat-list>
      <ng-container *ngFor="let project of projects; trackBy: trackById; let last = last">
        <mat-list-item>
          <mat-icon matListItemIcon aria-hidden="true">folder</mat-icon>

          <div matListItemTitle>
            {{ project.name }}
            <span class="badge"
            *ngIf="project.origin"
            [class.api]="project.origin === 'api'"
            [class.local]="project.origin === 'local'">
            {{ project.origin === 'api' ? 'API' : 'LOCAL' }}
            </span>
            <!-- estado local -->
            <span class="badge" [style.background]="'#e8f5e9'" [style.color]="'#2e7d32'">
              {{ project.active === false ? 'Inactive' : 'Active' }}
            </span>
          </div>

          <div matListItemLine>{{ project.description }}</div>

          <span matListItemMeta class="actions">
            <button mat-icon-button color="primary" matTooltip="Edit" (click)="editProject(project)" aria-label="Edit project">
              <mat-icon>edit</mat-icon>
            </button>
            <button mat-icon-button color="warn" matTooltip="Delete" (click)="deleteProject(project)" aria-label="Delete project">
              <mat-icon>delete</mat-icon>
            </button>
            <button mat-icon-button color="accent" matTooltip="Tasks" [routerLink]="['/projects', project.id, 'tasks']" aria-label="View tasks">
              <mat-icon>list</mat-icon>
            </button>
          </span>
        </mat-list-item>

        <mat-divider *ngIf="!last" inset></mat-divider>
      </ng-container>
    </mat-list>
  </div>
</section>
  `,
  styles: [`
    h2 { margin-top: 0; }

    .toolbar { display: flex; gap: 8px; margin-bottom: 8px; }

    /* Estado visual (loading/error) */
    .state {
      display: flex;
      align-items: center;
      gap: .5rem;
      padding: 1rem;
      margin-top: 1rem;
      color: #555;
    }

    /* Acciones a la derecha del item */
    .actions {
      display: inline-flex;
      align-items: center;
      gap: .25rem;
    }
  `],
})
export class ProjectsPage implements OnInit {
  projects: Project[] = [];
  loading = false;
  error: string | null = null;
  showForm = false;
  editingProject: Project | null = null;

  constructor(
    private projectsApi: ProjectsApiService,
    private notification: NotificationService,
    private dialog: MatDialog,
  ) {}

  ngOnInit(): void { this.loadProjects(); }

  loadProjects(): void {
    this.loading = true;
    this.error = null;
    this.projectsApi.fetchProjects().subscribe({
      next: (projects) => { this.projects = projects; this.loading = false; },
      error: (err) => { this.error = err?.message ?? 'Failed to load projects'; this.loading = false; },
    });
  }

  startCreate(): void { this.editingProject = null; this.showForm = true; }
  editProject(project: Project): void { this.editingProject = project; this.showForm = true; }
  cancelEdit(): void { this.showForm = false; this.editingProject = null; }
// Notificación de éxito y recarga (mantiene UI sincronizada con la fuente).
  saveProject(data: Partial<Project>): void {
    if (this.editingProject) {
      const updated: Project = { ...this.editingProject, ...data } as Project;
      this.projectsApi.updateProject(updated).subscribe(() => {
        this.notification.showSuccess('Project updated');
        this.showForm = false; this.editingProject = null; this.loadProjects();
      });
    } else {
      this.projectsApi.createProject(data as Omit<Project, 'id'>).subscribe(() => {
        this.notification.showSuccess('Project created');
        this.showForm = false; this.loadProjects();
      });
    }
  }
// Confirmación antes de borrar: patrón consistente con Tasks.
  deleteProject(project: Project): void {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: { title: 'Delete Project', message: `Delete project “${project.name}”?` },
    });
    ref.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        this.projectsApi.deleteProject(project.id).subscribe(() => {
          this.notification.showSuccess('Project deleted');
          this.loadProjects();
        });
      }
    });
  }
// Evita rerender innecesario en *ngFor al actualizar la lista.

  trackById(_: number, p: Project): number { return p.id; }
}
