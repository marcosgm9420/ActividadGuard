import { Injectable, signal, computed } from '@angular/core';

// Los dos roles posibles de la aplicación
export type UserRole = 'admin' | 'user';

export interface UserSession {
  username: string;
  role: UserRole;
  isAuthenticated: boolean;
}

// Estructura de un usuario "registrado" (simulado, sin base de datos)
interface UserCredentials {
  username: string;
  password: string;
  role: UserRole;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly STORAGE_KEY = 'DAM2_AUTH_SESSION';

  // Lista de usuarios permitidos
  private readonly users: UserCredentials[] = [
    { username: 'admin',    password: '123', role: 'admin' },
    { username: 'operador', password: '123', role: 'user'  }
  ];

  // Estado reactivo (Signal) con la sesión actual
  private _currentUser = signal<UserSession | null>(this.readSessionFromStorage());

  // Selectores de solo lectura
  public currentUser = this._currentUser.asReadonly();
  public isAuthenticated = computed(() => this._currentUser()?.isAuthenticated ?? false);
  public userRole = computed(() => this._currentUser()?.role ?? null);

  /**
   * Busca el usuario en la lista. Si existe, guarda la sesión.
   */
  public login(user: string, pass: string): boolean {
    const found = this.users.find(u => u.username === user && u.password === pass);

    if (!found) {
      return false;
    }

    const sessionData: UserSession = {
      username: found.username,
      role: found.role,
      isAuthenticated: true
    };

    // 1. Guardar en memoria reactiva
    this._currentUser.set(sessionData);
    // 2. Persistir en el navegador
    sessionStorage.setItem(this.STORAGE_KEY, JSON.stringify(sessionData));
    return true;
  }

  public logout(): void {
    sessionStorage.removeItem(this.STORAGE_KEY);
    this._currentUser.set(null);
  }

  /**
   * ¿El usuario actual tiene este rol?
   */
  public hasRole(role: string): boolean {
    return this._currentUser()?.role === role;
  }

  /**
   * Devuelve la "página de inicio" que le toca a cada rol
   */
  public getHomeRoute(): string {
    return this.userRole() === 'admin' ? '/admin' : '/user-dashboard';
  }

  private readSessionFromStorage(): UserSession | null {
    const rawData = sessionStorage.getItem(this.STORAGE_KEY);
    if (!rawData) {
      return null;
    }
    try {
      return JSON.parse(rawData) as UserSession;
    } catch {
      sessionStorage.removeItem(this.STORAGE_KEY);
      return null;
    }
  }
}