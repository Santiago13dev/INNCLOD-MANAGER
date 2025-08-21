import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { HttpService } from '../../../core/services/http.service';

export interface Project {
  id: number;
  name: string;
  description: string;
  active?: boolean;
  origin?: 'api' | 'local';   
}

/**
 * API de Projects: mezcla datos remotos y locales.
 * - GET /users → mapeo a {id, name, description}, active:true, origin:'api'.
 * - create/update/delete → afectan solo store local (JSONPlaceholder no persiste).
 * Decisión: modelar 'active' y 'origin' para demostrar estado local y badges en UI.
 */

@Injectable({ providedIn: 'root' })
export class ProjectsApiService {
  private readonly baseUrl = 'https://jsonplaceholder.typicode.com/users';
  private readonly localProjects: Project[] = [];

  constructor(private http: HttpService) {}

  // 'force' agrega timestamp anti-caché → la petición se ve en Network durante la demo.

  fetchProjects(force = false): Observable<Project[]> {
    const url = force ? `${this.baseUrl}?_t=${Date.now()}` : this.baseUrl;

    return this.http.get<any[]>(url).pipe(
      map((users) =>
          users.map((u: any) => ({
          id: Number(u.id),
          name: String(u.name ?? ''),
          description: String(u.company?.catchPhrase ?? ''),
          active: true,
          origin: 'api', // por defecto, los que vienen de API están activos
        }) as Project),
      ),
      map((apiProjects) => {
        // Local tiene prioridad: respeta ediciones/creaciones sobre lo que venga de la API.
        const merged = [...apiProjects];
        for (const local of this.localProjects) {
          const index = merged.findIndex((p) => p.id === local.id);
          if (index >= 0) {
            merged[index] = { ...merged[index], ...local };
          } else {
            merged.push(local);
          }
        }
        return merged;
      }),
    );
  }

  /**
   * Creates a new project locally. Returns an observable for API parity.
   */
  createProject(project: Omit<Project, 'id'>): Observable<Project> {
    // Generate a unique id by taking the max existing id + 1
    const newId = this.localProjects.length
      ? Math.max(...this.localProjects.map((p) => p.id)) + 1
      : Date.now();

    const created: Project = {
      id: newId,
      name: project.name,
      description: project.description ?? '',
      active: project.active ?? true,
      origin: 'local',
    };
    this.localProjects.push(created);
    return of(created);
  }

  /**
   * Updates an existing project locally. Returns an observable for API parity.
   */
  updateProject(project: Project): Observable<Project> {
    const updated: Project = {
      id: project.id,
      name: project.name,
      description: project.description ?? '',
      active: project.active ?? true,
      origin: 'local',
    };

    const index = this.localProjects.findIndex((p) => p.id === project.id);
    if (index >= 0) {
      this.localProjects[index] = updated;
    } else {
      this.localProjects.push(updated);
    }
    return of(updated);
  }

  /**
   * Removes a project from the local store. Returns an observable for API parity.
   */
  deleteProject(id: number): Observable<void> {
    const idx = this.localProjects.findIndex((p) => p.id === id);
    if (idx >= 0) {
      this.localProjects.splice(idx, 1);
    }
    return of(void 0);
  }
}
