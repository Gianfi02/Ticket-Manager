package it.tesina.ticketmanager.repository;

import it.tesina.ticketmanager.model.Ticket;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TicketRepository extends JpaRepository<Ticket, Long> {
}
