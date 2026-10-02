import { BreakpointObserver } from '@angular/cdk/layout';
import { DatePipe } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { Router, RouterLink } from '@angular/router';
import { map } from 'rxjs';
import { errorMessage } from '../../core/models/api-error.model';
import {
  PRIORITIES,
  PRIORITY_LABELS,
  Priority,
  STATUSES,
  STATUS_LABELS,
  Ticket,
  TicketStatus,
} from '../../core/models/ticket.model';
import { TicketService } from '../../core/services/ticket.service';
import { PriorityBadge, StatusBadge } from '../../shared/ticket-badges';
import { TicketView, filterTickets } from './ticket-filter';

@Component({
  selector: 'app-ticket-list',
  imports: [
    DatePipe,
    FormsModule,
    RouterLink,
    MatButtonModule,
    MatButtonToggleModule,
    MatCardModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressBarModule,
    MatSelectModule,
    MatTableModule,
    StatusBadge,
    PriorityBadge,
  ],
  templateUrl: './ticket-list.html',
  styleUrl: './ticket-list.scss',
})
export class TicketList implements OnInit {
  private readonly ticketService = inject(TicketService);
  private readonly router = inject(Router);

  protected readonly priorities = PRIORITIES;
  protected readonly statuses = STATUSES;
  protected readonly priorityLabels = PRIORITY_LABELS;
  protected readonly statusLabels = STATUS_LABELS;
  protected readonly columns = ['id', 'title', 'requester', 'createdAt', 'priority', 'status'];

  protected readonly isMobile = toSignal(
    inject(BreakpointObserver)
      .observe('(max-width: 767px)')
      .pipe(map((state) => state.matches)),
    { initialValue: false },
  );

  protected readonly tickets = signal<Ticket[]>([]);
  protected readonly loading = signal(true);
  protected readonly loadError = signal<string | null>(null);

  // Criteri di ricerca / filtro
  protected readonly view = signal<TicketView>('ACTIVE');
  protected readonly search = signal('');
  protected readonly status = signal<TicketStatus | null>(null);
  protected readonly priority = signal<Priority | null>(null);

  protected readonly filtered = computed(() =>
    filterTickets(this.tickets(), {
      view: this.view(),
      search: this.search(),
      status: this.status(),
      priority: this.priority(),
    }),
  );
  protected readonly activeCount = computed(() => this.tickets().filter((t) => t.status !== 'CHIUSO').length);
  protected readonly closedCount = computed(() => this.tickets().filter((t) => t.status === 'CHIUSO').length);

  /** Stati selezionabili nel filtro, coerenti con la vista corrente. */
  protected readonly availableStatuses = computed(() => {
    switch (this.view()) {
      case 'ACTIVE':
        return this.statuses.filter((s) => s !== 'CHIUSO');
      case 'CLOSED':
        return [];
      default:
        return this.statuses;
    }
  });

  protected readonly hasFilters = computed(() => !!this.search() || !!this.status() || !!this.priority());

  ngOnInit(): void {
    this.load();
  }

  protected load(): void {
    this.loading.set(true);
    this.loadError.set(null);
    this.ticketService.getAll().subscribe({
      next: (tickets) => {
        this.tickets.set(tickets);
        this.loading.set(false);
      },
      error: (err: unknown) => {
        this.loadError.set(errorMessage(err));
        this.loading.set(false);
      },
    });
  }

  protected changeView(view: TicketView): void {
    this.view.set(view);
    const status = this.status();
    if (status && !this.availableStatuses().includes(status)) {
      this.status.set(null);
    }
  }

  protected resetFilters(): void {
    this.search.set('');
    this.status.set(null);
    this.priority.set(null);
  }

  protected open(ticket: Ticket): void {
    this.router.navigate(['/tickets', ticket.id]);
  }
}
