package it.tesina.ticketmanager.dto;

import it.tesina.ticketmanager.model.Priority;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/**
 * Dati inviati dal client per creare o modificare un ticket.
 * Lo stato non è modificabile qui: cambia solo tramite presa in carico / chiusura.
 */
public record TicketRequest(
        @NotBlank(message = "Il titolo è obbligatorio")
        @Size(min = 3, max = 100, message = "Il titolo deve contenere tra 3 e 100 caratteri")
        String title,

        @NotBlank(message = "La descrizione è obbligatoria")
        @Size(min = 10, max = 2000, message = "La descrizione deve contenere tra 10 e 2000 caratteri")
        String description,

        @NotBlank(message = "Il nome del richiedente è obbligatorio")
        @Size(min = 2, max = 100, message = "Il nome del richiedente deve contenere tra 2 e 100 caratteri")
        String requesterName,

        @NotBlank(message = "L'email del richiedente è obbligatoria")
        @Email(regexp = "^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$", message = "L'email del richiedente non è valida")
        @Size(max = 150, message = "L'email non può superare i 150 caratteri")
        String requesterEmail,

        @NotNull(message = "La priorità è obbligatoria")
        Priority priority
) {
}
