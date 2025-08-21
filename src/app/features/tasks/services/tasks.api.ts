import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { HttpService } from '../../../core/services/http.service';

/** Data structure representing a task associated to a project. */
export interface Task {
  id: number;
  projectId: number;
  title: string;
  completed: boolean;
}

/**
 * Service responsible for retrieving and managing tasks for a given project.
 * Uses jsonplaceholder.typicode.com for fetching initial data and stores
 * newly created/updated items locally.
 */
@Injectable({ providedIn: 'root' })
export class TasksApiService {
  private readonly baseUrl = 'https://jsonplaceholder.typicode.com/todos';
  /** Locally persisted tasks that were created or edited. */
  private readonly localTasks: Task[] = [];

  constructor(private http: HttpService) {}

  /**
   * Fetch tasks from API filtered by projectId (userId in JSONPlaceholder)
   * and merge them with locally persisted items.
   * Se añade un parámetro anti-caché para que la petición se vea siempre en Network.
   */
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
        // (El API ya viene filtrado por userId, pero mantenemos el filtro por seguridad)
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

  /** Creates a new task locally. Returns an observable for API parity. */
  createTask(task: Omit<Task, 'id'>): Observable<Task> {
    const newId = this.localTasks.length
      ? Math.max(...this.localTasks.map((t) => t.id)) + 1
      : Date.now();
    const created: Task = { id: newId, ...task };
    this.localTasks.push(created);
    return of(created);
  }

  /** Updates an existing local task. Returns an observable for API parity. */
  updateTask(task: Task): Observable<Task> {
    const index = this.localTasks.findIndex((t) => t.id === task.id);
    if (index >= 0) this.localTasks[index] = task;
    else this.localTasks.push(task);
    return of(task);
  }

  /** Deletes a local task. Returns an observable for API parity. */
  deleteTask(id: number): Observable<void> {
    const idx = this.localTasks.findIndex((t) => t.id === id);
    if (idx >= 0) this.localTasks.splice(idx, 1);
    return of(void 0);
  }
}
