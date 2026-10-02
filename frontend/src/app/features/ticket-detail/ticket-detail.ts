import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, inject, input, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { Router, RouterLink } from '@angular/router';
import { Observable, filter, switchMap } from 'rxjs';
import { errorMessage } from '../../core/models/api-error.model';
import { Ticket } from '../../core/models/ticket.model';
import { NotificationService } from '../../core/services/notification.service';
import { TicketService } from '../../core/services/ticket.service';
import { ConfirmDialog, ConfirmDialogData } from '../../shared/confirm-dialog';
import { PriorityBadge, StatusBadge } from '../../shared/ticket-badges';

@Component({
  selector: 'app-ticket-detail',
  imports: [
    DatePipe,
    RouterLink,
    MatButtonModule,
    MatCardModule,
    MatDividerModule,
    MatIconModule,
    MatProgressBarModule,
    StatusBadge,
    PriorityBadge,
  ],
  templateUrl: './ticket-detail.html',
  styleUrl: './ticket-detail.scss',
})
export class TicketDetail implements OnInit {
  private readonly ticketService = inject(TicketService);
  private readonly notification = inject(NotificationService);
  private readonly dialog = inject(MatDialog);
  private readonly router = inject(Router);

  /** Parametro di rotta ":id". */
  readonly id = input.required<string>();

  protected readonly ticket = signal<Ticket | null>(null);
  protected readonly loading = signal(true);
  protected readonly busy = signal(false);
  protected readonly notFound = signal(false);
  protected readonly loadError = signal<string | null>(null);

  ngOnInit(): void {
    this.load();
  }

  protected load(): void {
    const id = Number(this.id());
    if (!Number.isInteger(id) || id <= 0) {
      this.notFound.set(true);
      this.loading.set(false);
      return;
    }
    this.loading.set(true);
    this.loadError.set(null);
    this.ticketService.getById(id).subscribe({
      next: (t) => {
        this.ticket.set(t);
        this.loading.set(false);
      },
      error: (err: unknown) => {
        if (err instanceof HttpErrorResponse && err.status === 404) {
          this.notFound.set(true);
        } else {
          this.loadError.set(errorMessage(err));
        }
        this.loading.set(false);
      },
    });
  }

  protected takeCharge(t: Ticket): void {
    this.run(this.ticketService.takeCharge(t.id), `Ticket #${t.id} preso in carico`);
  }

  protected close(t: Ticket): void {
    this.confirm({
      title: 'Chiudere il ticket?',
      message: `Il ticket #${t.id} verrà chiuso e non sarà più modificabile.`,
      confirmLabel: 'Chiudi ticket',
    })
      .pipe(filter(Boolean))
      .subscribe(() => this.run(this.ticketService.close(t.id), `Ticket #${t.id} chiuso`));
  }

  protected remove(t: Ticket): void {
    this.confirm({
      title: 'Eliminare il ticket?',
      message: `Il ticket #${t.id} "${t.title}" verrà eliminato definitivamente. L'operazione non è reversibile.`,
      confirmLabel: 'Elimina',
    })
      .pipe(
        filter(Boolean),
        switchMap(() => {
          this.busy.set(true);
          return this.ticketService.delete(t.id);
        }),
      )
      .subscribe({
        next: () => {
          this.notification.success(`Ticket #${t.id} eliminato`);
          this.router.navigate(['/tickets']);
        },
        error: (err: unknown) => {
          this.busy.set(false);
          this.notification.error(errorMessage(err));
        },
      });
  }

  /** Esegue un cambio di stato e aggiorna il ticket mostrato. */
  private run(action: Observable<Ticket>, successMessage: string): void {
    this.busy.set(true);
    action.subscribe({
      next: (updated) => {
        this.ticket.set(updated);
        this.busy.set(false);
        this.notification.success(successMessage);
      },
      error: (err: unknown) => {
        this.busy.set(false);
        this.notification.error(errorMessage(err));
        this.load(); // lo stato potrebbe essere cambiato nel frattempo
      },
    });
  }

  private confirm(data: ConfirmDialogData): Observable<boolean | undefined> {
    return this.dialog.open<ConfirmDialog, ConfirmDialogData, boolean>(ConfirmDialog, { data }).afterClosed();
  }
}
