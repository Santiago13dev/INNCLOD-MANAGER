/**
 * Wrapper genérico sobre HttpClient.
 * - get/post/put/delete<T>() tipados.
 * - Punto único para headers comunes o futuras extensiones (p. ej. BASE_API).
 * Decisión: aislar HttpClient facilita tests y cambios (p. ej. mover base URL a environments).
 */

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';


@Injectable({ providedIn: 'root' })
export class HttpService {
  constructor(private http: HttpClient) {}
// Usamos genéricos <T> para que el consumidor reciba tipos correctos sin casteos.

  get<T>(url: string): Observable<T> {
    return this.http.get<T>(url);
  }
  post<T>(url: string, body: unknown): Observable<T> {
    return this.http.post<T>(url, body);
  }
  put<T>(url: string, body: unknown): Observable<T> {
    return this.http.put<T>(url, body);
  }
  delete<T>(url: string): Observable<T> {
    return this.http.delete<T>(url);
  }
}