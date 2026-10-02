package it.tesina.ticketmanager.service;

import it.tesina.ticketmanager.dto.TicketRequest;
import it.tesina.ticketmanager.dto.TicketResponse;
import it.tesina.ticketmanager.exception.InvalidTicketStateException;
import it.tesina.ticketmanager.exception.TicketNotFoundException;
import it.tesina.ticketmanager.model.Priority;
import it.tesina.ticketmanager.model.Ticket;
import it.tesina.ticketmanager.model.TicketStatus;
import it.tesina.ticketmanager.repository.TicketRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.time.Clock;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class TicketServiceTest {

    private static final ZoneId ZONE = ZoneId.of("Europe/Rome");
    private static final Instant NOW = Instant.parse("2026-09-29T10:00:00Z");

    private TicketRepository repository;
    private TicketService service;

    @BeforeEach
    void setUp() {
        repository = mock(TicketRepository.class);
        service = new TicketService(repository, Clock.fixed(NOW, ZONE));
        when(repository.save(any(Ticket.class))).thenAnswer(inv -> {
            Ticket t = inv.getArgument(0);
            t.setId(1L);
            return t;
        });
    }

    @Test
    void createSetsStatusApertoAndDates() {
        TicketResponse created = service.create(new TicketRequest(
                "  Stampante guasta ", "La stampante non stampa da ieri", "Mario Rossi", "Mario@Example.com", Priority.ALTA));

        assertThat(created.id()).isEqualTo(1L);
        assertThat(created.status()).isEqualTo(TicketStatus.APERTO);
        assertThat(created.title()).isEqualTo("Stampante guasta");
        assertThat(created.requesterEmail()).isEqualTo("mario@example.com");
        assertThat(created.createdAt()).isEqualTo(LocalDateTime.ofInstant(NOW, ZONE));
        assertThat(created.updatedAt()).isEqualTo(created.createdAt());
        assertThat(created.closedAt()).isNull();
    }

    @Test
    void takeChargeMovesApertoToInCarico() {
        Ticket t = ticket(TicketStatus.APERTO);
        when(repository.findById(1L)).thenReturn(Optional.of(t));

        TicketResponse result = service.takeCharge(1L);

        assertThat(result.status()).isEqualTo(TicketStatus.IN_CARICO);
        assertThat(result.updatedAt()).isEqualTo(LocalDateTime.ofInstant(NOW, ZONE));
    }

    @Test
    void takeChargeRejectedIfNotAperto() {
        when(repository.findById(1L)).thenReturn(Optional.of(ticket(TicketStatus.IN_CARICO)));
        assertThatThrownBy(() -> service.takeCharge(1L)).isInstanceOf(InvalidTicketStateException.class);
    }

    @Test
    void closeMovesInCaricoToChiusoAndSetsClosedAt() {
        when(repository.findById(1L)).thenReturn(Optional.of(ticket(TicketStatus.IN_CARICO)));

        TicketResponse result = service.close(1L);

        assertThat(result.status()).isEqualTo(TicketStatus.CHIUSO);
        assertThat(result.closedAt()).isEqualTo(LocalDateTime.ofInstant(NOW, ZONE));
    }

    @Test
    void closeRejectedIfAperto() {
        when(repository.findById(1L)).thenReturn(Optional.of(ticket(TicketStatus.APERTO)));
        assertThatThrownBy(() -> service.close(1L)).isInstanceOf(InvalidTicketStateException.class);
    }

    @Test
    void updateRejectedIfChiuso() {
        when(repository.findById(1L)).thenReturn(Optional.of(ticket(TicketStatus.CHIUSO)));
        TicketRequest request = new TicketRequest("Nuovo titolo", "Nuova descrizione lunga", "Anna", "anna@test.it", Priority.BASSA);
        assertThatThrownBy(() -> service.update(1L, request)).isInstanceOf(InvalidTicketStateException.class);
    }

    @Test
    void updateChangesDataAndUpdatedAt() {
        when(repository.findById(1L)).thenReturn(Optional.of(ticket(TicketStatus.IN_CARICO)));

        TicketResponse result = service.update(1L,
                new TicketRequest("Nuovo titolo", "Nuova descrizione lunga", "Anna", "anna@test.it", Priority.BASSA));

        assertThat(result.title()).isEqualTo("Nuovo titolo");
        assertThat(result.priority()).isEqualTo(Priority.BASSA);
        assertThat(result.status()).isEqualTo(TicketStatus.IN_CARICO);
        assertThat(result.updatedAt()).isEqualTo(LocalDateTime.ofInstant(NOW, ZONE));
    }

    @Test
    void notFoundThrows() {
        when(repository.findById(99L)).thenReturn(Optional.empty());
        assertThatThrownBy(() -> service.findById(99L)).isInstanceOf(TicketNotFoundException.class);
    }

    @Test
    void deleteRemovesTicket() {
        Ticket t = ticket(TicketStatus.CHIUSO);
        when(repository.findById(1L)).thenReturn(Optional.of(t));
        service.delete(1L);
        verify(repository).delete(t);
    }

    private Ticket ticket(TicketStatus status) {
        Ticket t = new Ticket();
        t.setId(1L);
        t.setTitle("Titolo");
        t.setDescription("Descrizione di prova");
        t.setRequesterName("Mario");
        t.setRequesterEmail("mario@example.com");
        t.setPriority(Priority.MEDIA);
        t.setStatus(status);
        LocalDateTime past = LocalDateTime.of(2026, 1, 1, 9, 0);
        t.setCreatedAt(past);
        t.setUpdatedAt(past);
        return t;
    }
}
