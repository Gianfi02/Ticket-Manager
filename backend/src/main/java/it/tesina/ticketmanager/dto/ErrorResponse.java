package it.tesina.ticketmanager.dto;

import java.time.LocalDateTime;
import java.util.Map;

public record ErrorResponse(
        LocalDateTime timestamp,
        int status,
        String message,
        Map<String, String> fieldErrors
) {
    public static ErrorResponse of(int status, String message) {
        return new ErrorResponse(LocalDateTime.now(), status, message, Map.of());
    }
}
