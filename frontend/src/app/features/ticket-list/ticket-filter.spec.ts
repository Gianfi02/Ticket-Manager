import { Ticket } from '../../core/models/ticket.model';
import { TicketFilter, filterTickets } from './ticket-filter';

function ticket(id: number, title: string, status: Ticket['status'], priority: Ticket['priority']): Ticket {
  return {
    id,
    title,
    description: 'Descrizione di prova',
    requesterName: 'Mario Rossi',
    requesterEmail: 'mario@example.com',
    priority,
    status,
    createdAt: '2026-09-01T10:00:00',
    updatedAt: '2026-09-01T10:00:00',
    closedAt: status === 'CHIUSO' ? '2026-09-02T10:00:00' : null,
  };
}

const tickets: Ticket[] = [
  ticket(1, 'Stampante guasta', 'APERTO', 'ALTA'),
  ticket(2, 'Password dimenticata', 'IN_CARICO', 'BASSA'),
  ticket(12, 'Stampante senza toner', 'CHIUSO', 'MEDIA'),
];

const all: TicketFilter = { view: 'ALL', search: '', status: null, priority: null };
const ids = (list: Ticket[]) => list.map((t) => t.id);

describe('filterTickets', () => {
  it('senza filtri restituisce tutti i ticket', () => {
    expect(ids(filterTickets(tickets, all))).toEqual([1, 2, 12]);
  });

  it('la vista "da gestire" esclude i ticket chiusi', () => {
    expect(ids(filterTickets(tickets, { ...all, view: 'ACTIVE' }))).toEqual([1, 2]);
  });

  it('la vista "chiusi" mostra solo i ticket chiusi', () => {
    expect(ids(filterTickets(tickets, { ...all, view: 'CLOSED' }))).toEqual([12]);
  });

  it('cerca per titolo ignorando maiuscole/minuscole', () => {
    expect(ids(filterTickets(tickets, { ...all, search: 'STAMPANTE' }))).toEqual([1, 12]);
  });

  it('cerca per ID esatto, anche con il prefisso #', () => {
    expect(ids(filterTickets(tickets, { ...all, search: '12' }))).toEqual([12]);
    expect(ids(filterTickets(tickets, { ...all, search: '#1' }))).toEqual([1]);
  });

  it('filtra per stato e priorità', () => {
    expect(ids(filterTickets(tickets, { ...all, status: 'IN_CARICO' }))).toEqual([2]);
    expect(ids(filterTickets(tickets, { ...all, priority: 'ALTA' }))).toEqual([1]);
    expect(filterTickets(tickets, { ...all, status: 'APERTO', priority: 'BASSA' })).toEqual([]);
  });
});
