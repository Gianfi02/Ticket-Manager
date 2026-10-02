package it.tesina.ticketmanager.service;

import it.tesina.ticketmanager.dto.TicketRequest;
import it.tesina.ticketmanager.dto.TicketResponse;
import it.tesina.ticketmanager.exception.InvalidTicketStateException;
import it.tesina.ticketmanager.exception.TicketNotFoundException;
import it.tesina.ticketmanager.model.Ticket;
import it.tesina.ticketmanager.model.TicketStatus;
import it.tesina.ticketmanager.repository.TicketRepository;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Clock;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Logica di business dei ticket, incluse le transizioni di stato:
 * APERTO → IN_CARICO → CHIUSO.
 */
@Service
@Transactional
public class TicketService {

    private final TicketRepository repository;
    private final Clock clock;

    public TicketService(TicketRepository repository, Clock clock) {
        this.repository = repository;
        this.clock = clock;
    }

    @Transactional(readOnly = true)
    public List<TicketResponse> findAll() {
        return repository.findAll(Sort.by(Sort.Direction.DESC, "createdAt")).stream()
                .map(TicketResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public TicketResponse findById(Long id) {
        return TicketResponse.from(getTicket(id));
    }

    public TicketResponse create(TicketRequest request) {
        LocalDateTime now = LocalDateTime.now(clock);
        Ticket ticket = new Ticket();
        applyRequest(ticket, request);
        ticket.setStatus(TicketStatus.APERTO);
        ticket.setCreatedAt(now);
        ticket.setUpdatedAt(now);
        return TicketResponse.from(repository.save(ticket));
    }

    public TicketResponse update(Long id, TicketRequest request) {
        Ticket ticket = getTicket(id);
        if (ticket.getStatus() == TicketStatus.CHIUSO) {
            throw new InvalidTicketStateException("Il ticket #" + id + " è chiuso e non può essere modificato");
        }
        applyRequest(ticket, request);
        ticket.setUpdatedAt(LocalDateTime.now(clock));
        return TicketResponse.from(ticket);
    }

    public TicketResponse takeCharge(Long id) {
        Ticket ticket = getTicket(id);
        if (ticket.getStatus() != TicketStatus.APERTO) {
            throw new InvalidTicketStateException(
                    "Solo i ticket in stato APERTO possono essere presi in carico");
        }
        ticket.setStatus(TicketStatus.IN_CARICO);
        ticket.setUpdatedAt(LocalDateTime.now(clock));
        return TicketResponse.from(ticket);
    }

    public TicketResponse close(Long id) {
        Ticket ticket = getTicket(id);
        if (ticket.getStatus() != TicketStatus.IN_CARICO) {
            throw new InvalidTicketStateException(
                    "Solo i ticket in stato IN CARICO possono essere chiusi");
        }
        LocalDateTime now = LocalDateTime.now(clock);
        ticket.setStatus(TicketStatus.CHIUSO);
        ticket.setUpdatedAt(now);
        ticket.setClosedAt(now);
        return TicketResponse.from(ticket);
    }

    public void delete(Long id) {
        repository.delete(getTicket(id));
    }

    private Ticket getTicket(Long id) {
        return repository.findById(id).orElseThrow(() -> new TicketNotFoundException(id));
    }

    private void applyRequest(Ticket ticket, TicketRequest request) {
        ticket.setTitle(request.title().trim());
        ticket.setDescription(request.description().trim());
        ticket.setRequesterName(request.requesterName().trim());
        ticket.setRequesterEmail(request.requesterEmail().trim().toLowerCase());
        ticket.setPriority(request.priority());
    }
}
