package it.tesina.ticketmanager.exception;

public class TicketNotFoundException extends RuntimeException {

    public TicketNotFoundException(Long id) {
        super("Il ticket #" + id + " non esiste");
    }
}
