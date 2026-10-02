import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Ticket, TicketRequest } from '../models/ticket.model';

@Injectable({ providedIn: 'root' })
export class TicketService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/tickets`;

  getAll(): Observable<Ticket[]> {
    return this.http.get<Ticket[]>(this.baseUrl);
  }

  getById(id: number): Observable<Ticket> {
    return this.http.get<Ticket>(`${this.baseUrl}/${id}`);
  }

  create(request: TicketRequest): Observable<Ticket> {
    return this.http.post<Ticket>(this.baseUrl, request);
  }

  update(id: number, request: TicketRequest): Observable<Ticket> {
    return this.http.put<Ticket>(`${this.baseUrl}/${id}`, request);
  }

  takeCharge(id: number): Observable<Ticket> {
    return this.http.patch<Ticket>(`${this.baseUrl}/${id}/take-charge`, null);
  }

  close(id: number): Observable<Ticket> {
    return this.http.patch<Ticket>(`${this.baseUrl}/${id}/close`, null);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
