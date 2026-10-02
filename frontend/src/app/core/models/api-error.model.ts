import { HttpErrorResponse } from '@angular/common/http';

/** Corpo delle risposte di errore del backend. */
export interface ApiError {
  timestamp: string;
  status: number;
  message: string;
  fieldErrors: Record<string, string>;
}

/** Converte un errore HTTP in un messaggio comprensibile per l'utente. */
export function errorMessage(err: unknown): string {
  if (!(err instanceof HttpErrorResponse)) {
    return 'Si è verificato un errore imprevisto';
  }
  if (err.status === 0) {
    return 'Impossibile comunicare con il server. Verifica la connessione e riprova.';
  }
  const body = err.error as Partial<ApiError> | null;
  if (body && typeof body.message === 'string') {
    return body.message;
  }
  if (err.status >= 500) {
    return 'Errore del server. Riprova più tardi.';
  }
  return `Errore imprevisto (codice ${err.status})`;
}

/** Estrae gli errori di validazione per campo restituiti dal backend (status 400). */
export function fieldErrors(err: unknown): Record<string, string> {
  if (err instanceof HttpErrorResponse && err.status === 400) {
    return (err.error as Partial<ApiError> | null)?.fieldErrors ?? {};
  }
  return {};
}
