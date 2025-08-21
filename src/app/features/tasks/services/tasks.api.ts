import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { HttpService } from '../../../core/services/http.service';

export interface Task {
  id: number;
  projectId: number;
  title: string;
  completed: boolean;
}

/**
 * API de Tasks: por proyecto (userId en JSONPlaceholder).
 * - GET /todos?userId=... → mapeo a Task.
 * - Mezcla con tasks locales para simular persistencia.
 * Decisión: filtrar por userId hace evidente en Network que cambia el endpoint por proyecto.
 */
@Injectable({ providedIn: 'root' })
export class TasksApiService {
  private readonly baseUrl = 'https://jsonplaceholder.typicode.com/todos';
  private readonly localTasks: Task[] = [];

  constructor(private http: HttpService) {}

  fetchTasks(projectId: number): Observable<Task[]> {
    const url = `${this.baseUrl}?userId=${encodeURIComponent(projectId)}&_t=${Date.now()}`;

    return this.http.get<any[]>(url).pipe(
      map((items) =>
        items.map(
          (t: any) =>
            ({
              id: Number(t.id),
              projectId: Number(t.userId),
              title: String(t.title ?? ''),
              completed: !!t.completed,
            }) as Task,
        ),
      ),
      map((apiTasks) => {
        const merged = apiTasks.filter((t) => t.projectId === projectId);

        // Merge con locales (sobrescribe si coincide el id)
        for (const local of this.localTasks.filter((t) => t.projectId === projectId)) {
          const index = merged.findIndex((t) => t.id === local.id);
          if (index >= 0) merged[index] = local;
          else merged.push(local);
        }
        return merged;
      }),
    );
  }

  createTask(task: Omit<Task, 'id'>): Observable<Task> {
    const newId = this.localTasks.length
      ? Math.max(...this.localTasks.map((t) => t.id)) + 1
      : Date.now();
    const created: Task = { id: newId, ...task };
    this.localTasks.push(created);
    return of(created);
  }

  updateTask(task: Task): Observable<Task> {
    const index = this.localTasks.findIndex((t) => t.id === task.id);
    if (index >= 0) this.localTasks[index] = task;
    else this.localTasks.push(task);
    return of(task);
  }

  deleteTask(id: number): Observable<void> {
    const idx = this.localTasks.findIndex((t) => t.id === id);
    if (idx >= 0) this.localTasks.splice(idx, 1);
    return of(void 0);
  }
}
