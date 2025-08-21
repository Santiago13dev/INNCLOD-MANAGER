/**
 * Autenticación simulada con localStorage.
 * - login(): guarda {email, ts} bajo 'innclod_session'.
 * - isLoggedIn(): lectura simple para guards y UI.
 * - logout(): limpieza + navegación a /login.
 * Decisión: mantenerlo “fake” y minimalista (no hay backend en la prueba).
 */
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

interface Session { email: string; ts: number; }

// Nueva clave “oficial”
const KEY = 'innclod_session';
// Clave antigua (por si quedó)
const LEGACY_KEY = 'session';

@Injectable({ providedIn: 'root' })
export class AuthService {
  constructor(private router: Router) {}

  private readRaw(): string | null {
    return localStorage.getItem(KEY) ?? localStorage.getItem(LEGACY_KEY);
  }

  isLoggedIn(): boolean {
    return !!this.readRaw();
  }

  getUser(): Session | null {
    const raw = this.readRaw();
    try { return raw ? (JSON.parse(raw) as Session) : null; } catch { return null; }
  }
// Nota: no validamos credenciales (requisito de la prueba: autenticación simulada).
  /**
   * Simula un login guardando {email, ts} en localStorage.
   * - Limpia la clave antigua si existía.
   * - Navega a /projects tras el login exitoso.
   */
  login(email: string, _password: string): void {
    const payload: Session = { email, ts: Date.now() };
    // Siempre guardamos en la clave nueva
    localStorage.setItem(KEY, JSON.stringify(payload));
    // Limpieza de la clave vieja si existía
    localStorage.removeItem(LEGACY_KEY);
  }

  logout(): void {
    localStorage.removeItem(KEY);
    localStorage.removeItem(LEGACY_KEY); 
    this.router.navigate(['/login']);
  }
}
