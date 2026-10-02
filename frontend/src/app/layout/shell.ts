import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterLink, RouterOutlet } from '@angular/router';
import { AuthService } from '../core/services/auth.service';

/** Layout delle pagine autenticate: barra superiore con utente e logout. */
@Component({
  selector: 'app-shell',
  imports: [RouterOutlet, RouterLink, MatToolbarModule, MatButtonModule, MatIconModule, MatTooltipModule],
  template: `
    <mat-toolbar class="toolbar">
      <a routerLink="/tickets" class="brand">
        <mat-icon>support_agent</mat-icon>
        <span>Ticket Manager</span>
      </a>
      <span class="spacer"></span>
      <span class="user">
        <mat-icon>account_circle</mat-icon>
        <span class="user-name">{{ auth.username() }}</span>
      </span>
      <button mat-icon-button (click)="auth.logout()" matTooltip="Esci" aria-label="Esci">
        <mat-icon>logout</mat-icon>
      </button>
    </mat-toolbar>
    <main class="content">
      <router-outlet />
    </main>
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      min-height: 100%;
    }
    .toolbar {
      position: sticky;
      top: 0;
      z-index: 10;
      background: var(--mat-sys-primary);
      color: var(--mat-sys-on-primary);
      gap: 8px;
    }
    .brand {
      display: flex;
      align-items: center;
      gap: 8px;
      color: inherit;
      text-decoration: none;
    }
    .spacer {
      flex: 1;
    }
    .user {
      display: flex;
      align-items: center;
      gap: 6px;
      font: var(--mat-sys-body-large);
    }
    .toolbar button {
      color: inherit;
    }
    .content {
      flex: 1;
      width: 100%;
      max-width: 1200px;
      margin: 0 auto;
      padding: 24px 16px;
      box-sizing: border-box;
    }
    @media (max-width: 599px) {
      .user-name {
        display: none;
      }
      .content {
        padding: 16px 12px;
      }
    }
  `,
})
export class Shell {
  protected readonly auth = inject(AuthService);
}
