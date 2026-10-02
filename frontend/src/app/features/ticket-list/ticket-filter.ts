import { Priority, Ticket, TicketStatus } from '../../core/models/ticket.model';

/** Vista principale: ticket da gestire (APERTO / IN CARICO), chiusi, o tutti. */
export type TicketView = 'ACTIVE' | 'CLOSED' | 'ALL';

export interface TicketFilter {
  view: TicketView;
  search: string;
  status: TicketStatus | null;
  priority: Priority | null;
}

/**
 * Filtra i ticket lato client.
 * La ricerca confronta il testo con l'ID (anche nel formato "#12") o con il titolo.
 */
export function filterTickets(tickets: readonly Ticket[], filter: TicketFilter): Ticket[] {
  const search = filter.search.trim().toLowerCase();
  const idSearch = search.replace(/^#/, '');
  const isNumeric = /^\d+$/.test(idSearch);

  return tickets.filter((t) => {
    if (filter.view === 'ACTIVE' && t.status === 'CHIUSO') return false;
    if (filter.view === 'CLOSED' && t.status !== 'CHIUSO') return false;
    if (filter.status && t.status !== filter.status) return false;
    if (filter.priority && t.priority !== filter.priority) return false;
    if (search) {
      const matchesId = isNumeric && String(t.id) === idSearch;
      const matchesTitle = t.title.toLowerCase().includes(search);
      if (!matchesId && !matchesTitle) return false;
    }
    return true;
  });
}
