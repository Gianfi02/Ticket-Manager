import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { TicketRequest } from '../models/ticket.model';
import { TicketService } from './ticket.service';

describe('TicketService', () => {
  let service: TicketService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(TicketService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('getAll chiama GET /api/tickets', () => {
    service.getAll().subscribe((list) => expect(list).toEqual([]));
    const req = http.expectOne('/api/tickets');
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });

  it('create invia i dati in POST', () => {
    const body: TicketRequest = {
      title: 'Titolo',
      description: 'Descrizione lunga',
      requesterName: 'Mario',
      requesterEmail: 'mario@example.com',
      priority: 'ALTA',
    };
    service.create(body).subscribe();
    const req = http.expectOne('/api/tickets');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(body);
    req.flush({});
  });

  it('takeCharge, close e delete usano gli endpoint corretti', () => {
    service.takeCharge(5).subscribe();
    service.close(5).subscribe();
    service.delete(5).subscribe();
    expect(http.expectOne('/api/tickets/5/take-charge').request.method).toBe('PATCH');
    expect(http.expectOne('/api/tickets/5/close').request.method).toBe('PATCH');
    expect(http.expectOne('/api/tickets/5').request.method).toBe('DELETE');
  });
});
