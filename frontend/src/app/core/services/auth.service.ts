import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';

interface LoginResponse {
  token: string;
  username: string;
}

interface Session {
  token: string;
  username: string;
}

const STORAGE_KEY = 'ticketmanager.session';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  private readonly session = signal<Session | null>(this.restore());

  readonly username = computed(() => this.session()?.username ?? null);
  readonly token = computed(() => this.session()?.token ?? null);

  /** Vero se esiste un token non ancora scaduto. */
  isLoggedIn(): boolean {
    const token = this.token();
    if (!token || isExpired(token)) {
      return false;
    }
    return true;
  }

  login(username: string, password: string): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${environment.apiUrl}/auth/login`, { username, password })
      .pipe(
        tap((res) => {
          const session = { token: res.token, username: res.username };
          this.session.set(session);
          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
          } catch {
            // storage non disponibile: la sessione resta solo in memoria
          }
        }),
      );
  }

  logout(): void {
    this.session.set(null);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignorato
    }
    this.router.navigate(['/login']);
  }

  private restore(): Session | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const session = raw ? (JSON.parse(raw) as Session) : null;
      return session && !isExpired(session.token) ? session : null;
    } catch {
      return null;
    }
  }
}

/** Legge la scadenza (claim "exp") dal payload del JWT. */
function isExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
    return typeof payload.exp === 'number' && payload.exp * 1000 < Date.now();
  } catch {
    return true;
  }
}
