import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, computed, inject, input, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { Router, RouterLink } from '@angular/router';
import { errorMessage, fieldErrors } from '../../core/models/api-error.model';
import { PRIORITIES, PRIORITY_LABELS, Priority, TicketRequest } from '../../core/models/ticket.model';
import { NotificationService } from '../../core/services/notification.service';
import { TicketService } from '../../core/services/ticket.service';

/** Stesse regole di validazione del backend (TicketRequest.java). */
export const TITLE_MIN = 3;
export const TITLE_MAX = 100;
export const DESCRIPTION_MIN = 10;
export const DESCRIPTION_MAX = 2000;
export const NAME_MIN = 2;
export const NAME_MAX = 100;
export const EMAIL_MAX = 150;
export const EMAIL_PATTERN = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

/** Rifiuta i valori composti solo da spazi. */
const notBlank = Validators.pattern(/\S/);

@Component({
  selector: 'app-ticket-form',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressBarModule,
    MatSelectModule,
  ],
  templateUrl: './ticket-form.html',
  styleUrl: './ticket-form.scss',
})
export class TicketForm implements OnInit {
  private readonly ticketService = inject(TicketService);
  private readonly notification = inject(NotificationService);
  private readonly router = inject(Router);

  /** Parametro di rotta ":id" (assente in creazione). */
  readonly id = input<string>();

  protected readonly isEdit = computed(() => this.id() !== undefined);
  protected readonly priorities = PRIORITIES;
  protected readonly priorityLabels = PRIORITY_LABELS;
  protected readonly limits = { TITLE_MIN, TITLE_MAX, DESCRIPTION_MIN, DESCRIPTION_MAX, NAME_MIN, NAME_MAX };

  protected readonly loading = signal(false);
  protected readonly saving = signal(false);
  protected readonly error = signal<string | null>(null);

  protected readonly form = inject(NonNullableFormBuilder).group({
    title: ['', [Validators.required, notBlank, Validators.minLength(TITLE_MIN), Validators.maxLength(TITLE_MAX)]],
    description: [
      '',
      [Validators.required, notBlank, Validators.minLength(DESCRIPTION_MIN), Validators.maxLength(DESCRIPTION_MAX)],
    ],
    requesterName: ['', [Validators.required, notBlank, Validators.minLength(NAME_MIN), Validators.maxLength(NAME_MAX)]],
    requesterEmail: [
      '',
      [Validators.required, Validators.pattern(EMAIL_PATTERN), Validators.maxLength(EMAIL_MAX)],
    ],
    priority: ['MEDIA' as Priority, Validators.required],
  });

  ngOnInit(): void {
    if (this.isEdit()) {
      this.loadTicket(Number(this.id()));
    }
  }

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.error.set('Controlla i campi evidenziati prima di salvare');
      return;
    }
    const value = this.form.getRawValue();
    const request: TicketRequest = {
      title: value.title.trim(),
      description: value.description.trim(),
      requesterName: value.requesterName.trim(),
      requesterEmail: value.requesterEmail.trim(),
      priority: value.priority,
    };

    this.saving.set(true);
    this.error.set(null);
    const save$ = this.isEdit()
      ? this.ticketService.update(Number(this.id()), request)
      : this.ticketService.create(request);

    save$.subscribe({
      next: (ticket) => {
        this.notification.success(this.isEdit() ? `Ticket #${ticket.id} aggiornato` : `Ticket #${ticket.id} creato`);
        this.router.navigate(['/tickets', ticket.id]);
      },
      error: (err: unknown) => {
        this.saving.set(false);
        this.applyServerErrors(fieldErrors(err));
        this.error.set(errorMessage(err));
      },
    });
  }

  /** Primo messaggio di errore da mostrare per un campo. */
  protected errorFor(field: keyof typeof this.form.controls): string | null {
    const errors = this.form.controls[field].errors;
    if (!errors) return null;
    if (errors['server']) return errors['server'];
    if (errors['required']) return 'Campo obbligatorio';
    if (errors['pattern'] && field === 'requesterEmail') return 'Inserisci un indirizzo email valido';
    if (errors['pattern']) return 'Il campo non può contenere solo spazi';
    if (errors['minlength']) return `Inserisci almeno ${errors['minlength'].requiredLength} caratteri`;
    if (errors['maxlength']) return `Massimo ${errors['maxlength'].requiredLength} caratteri`;
    return 'Valore non valido';
  }

  private loadTicket(id: number): void {
    this.loading.set(true);
    this.ticketService.getById(id).subscribe({
      next: (t) => {
        this.loading.set(false);
        if (t.status === 'CHIUSO') {
          this.notification.error(`Il ticket #${t.id} è chiuso e non può essere modificato`);
          this.router.navigate(['/tickets', t.id]);
          return;
        }
        this.form.setValue({
          title: t.title,
          description: t.description,
          requesterName: t.requesterName,
          requesterEmail: t.requesterEmail,
          priority: t.priority,
        });
      },
      error: (err: unknown) => {
        this.loading.set(false);
        if (err instanceof HttpErrorResponse && err.status === 404) {
          this.router.navigate(['/tickets', id]); // il dettaglio mostra "ticket non trovato"
        } else {
          this.error.set(errorMessage(err));
        }
      },
    });
  }

  private applyServerErrors(errors: Record<string, string>): void {
    for (const [field, message] of Object.entries(errors)) {
      const control = this.form.get(field);
      if (control) {
        control.setErrors({ server: message });
        control.markAsTouched();
      }
    }
  }
}
