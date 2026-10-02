import { Component, computed, input } from '@angular/core';
import { PRIORITY_LABELS, Priority, STATUS_LABELS, TicketStatus } from '../core/models/ticket.model';

@Component({
  selector: 'app-status-badge',
  template: `<span class="badge" [class]="'status-' + status().toLowerCase()">{{ label() }}</span>`,
})
export class StatusBadge {
  readonly status = input.required<TicketStatus>();
  protected readonly label = computed(() => STATUS_LABELS[this.status()]);
}

@Component({
  selector: 'app-priority-badge',
  template: `<span class="badge" [class]="'priority-' + priority().toLowerCase()">{{ label() }}</span>`,
})
export class PriorityBadge {
  readonly priority = input.required<Priority>();
  protected readonly label = computed(() => PRIORITY_LABELS[this.priority()]);
}
