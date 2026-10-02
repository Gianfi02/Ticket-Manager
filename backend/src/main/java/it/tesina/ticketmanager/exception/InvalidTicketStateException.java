package it.tesina.ticketmanager.exception;

/**
 * Operazione non consentita nello stato attuale del ticket
 * (es. chiudere un ticket non preso in carico, modificare un ticket chiuso).
 */
public class InvalidTicketStateException extends RuntimeException {

    public InvalidTicketStateException(String message) {
        super(message);
    }
}
