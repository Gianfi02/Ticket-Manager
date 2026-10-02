package it.tesina.ticketmanager.config;

import it.tesina.ticketmanager.model.AdminUser;
import it.tesina.ticketmanager.repository.AdminUserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

/**
 * All'avvio crea l'utente amministratore se non esiste già.
 */
@Component
public class DataInitializer implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    private final AdminUserRepository repository;
    private final PasswordEncoder passwordEncoder;
    private final String username;
    private final String password;

    public DataInitializer(AdminUserRepository repository, PasswordEncoder passwordEncoder,
                           @Value("${app.admin.username}") String username,
                           @Value("${app.admin.password}") String password) {
        this.repository = repository;
        this.passwordEncoder = passwordEncoder;
        this.username = username;
        this.password = password;
    }

    @Override
    public void run(ApplicationArguments args) {
        if (repository.findByUsername(username).isEmpty()) {
            repository.save(new AdminUser(username, passwordEncoder.encode(password)));
            log.info("Creato utente amministratore '{}'", username);
        }
    }
}
