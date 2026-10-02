import { Routes } from '@angular/router';
import { authGuard, loginGuard } from './core/guards/auth.guard';
import { Login } from './features/login/login';
import { TicketDetail } from './features/ticket-detail/ticket-detail';
import { TicketForm } from './features/ticket-form/ticket-form';
import { TicketList } from './features/ticket-list/ticket-list';
import { Shell } from './layout/shell';

export const routes: Routes = [
  { path: 'login', component: Login, canActivate: [loginGuard], title: 'Accesso - Ticket Manager' },
  {
    path: '',
    component: Shell,
    canActivate: [authGuard],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'tickets' },
      { path: 'tickets', component: TicketList, title: 'Ticket - Ticket Manager' },
      { path: 'tickets/new', component: TicketForm, title: 'Nuovo ticket - Ticket Manager' },
      { path: 'tickets/:id', component: TicketDetail, title: 'Dettaglio ticket - Ticket Manager' },
      { path: 'tickets/:id/edit', component: TicketForm, title: 'Modifica ticket - Ticket Manager' },
    ],
  },
  { path: '**', redirectTo: 'tickets' },
];
