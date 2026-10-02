package it.tesina.ticketmanager.dto;

import it.tesina.ticketmanager.model.Priority;
import it.tesina.ticketmanager.model.Ticket;
import it.tesina.ticketmanager.model.TicketStatus;

import java.time.LocalDateTime;

public record TicketResponse(
        Long id,
        String title,
        String description,
        String requesterName,
        String requesterEmail,
        Priority priority,
        TicketStatus status,
        LocalDateTime createdAt,
        LocalDateTime updatedAt,
        LocalDateTime closedAt
) {
    public static TicketResponse from(Ticket t) {
        return new TicketResponse(
                t.getId(), t.getTitle(), t.getDescription(),
                t.getRequesterName(), t.getRequesterEmail(),
                t.getPriority(), t.getStatus(),
                t.getCreatedAt(), t.getUpdatedAt(), t.getClosedAt());
    }
}
