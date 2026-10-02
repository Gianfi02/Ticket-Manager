package it.tesina.ticketmanager.exception;

public class InvalidCredentialsException extends RuntimeException {

    public InvalidCredentialsException() {
        super("Username o password non validi");
    }
}
