export type Priority = 'BASSA' | 'MEDIA' | 'ALTA';
export type TicketStatus = 'APERTO' | 'IN_CARICO' | 'CHIUSO';

export interface Ticket {
  id: number;
  title: string;
  description: string;
  requesterName: string;
  requesterEmail: string;
  priority: Priority;
  status: TicketStatus;
  createdAt: string;
  updatedAt: string;
  closedAt: string | null;
}

/** Dati inviati al backend per creare o modificare un ticket. */
export interface TicketRequest {
  title: string;
  description: string;
  requesterName: string;
  requesterEmail: string;
  priority: Priority;
}

export const PRIORITIES: readonly Priority[] = ['BASSA', 'MEDIA', 'ALTA'];
export const STATUSES: readonly TicketStatus[] = ['APERTO', 'IN_CARICO', 'CHIUSO'];

export const PRIORITY_LABELS: Record<Priority, string> = {
  BASSA: 'Bassa',
  MEDIA: 'Media',
  ALTA: 'Alta',
};

export const STATUS_LABELS: Record<TicketStatus, string> = {
  APERTO: 'Aperto',
  IN_CARICO: 'In carico',
  CHIUSO: 'Chiuso',
};
