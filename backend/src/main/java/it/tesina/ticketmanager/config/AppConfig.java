package it.tesina.ticketmanager.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.Clock;

@Configuration
public class AppConfig {

    /** Orologio iniettabile: permette ai test di controllare le date di creazione/modifica. */
    @Bean
    public Clock clock() {
        return Clock.systemDefaultZone();
    }
}
