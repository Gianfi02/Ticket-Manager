package it.tesina.ticketmanager.dto;

import jakarta.validation.constraints.NotBlank;

public record LoginRequest(
        @NotBlank(message = "Lo username è obbligatorio") String username,
        @NotBlank(message = "La password è obbligatoria") String password
) {
}
