package it.tesina.ticketmanager.security;

import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.Date;
import java.util.Optional;

/**
 * Genera e verifica i token JWT (firma HMAC-SHA256).
 */
@Service
public class JwtService {

    private final SecretKey key;
    private final Duration expiration;

    public JwtService(@Value("${app.jwt.secret}") String secret,
                      @Value("${app.jwt.expiration}") Duration expiration) {
        byte[] bytes = secret.getBytes(StandardCharsets.UTF_8);
        if (bytes.length < 32) {
            throw new IllegalStateException("app.jwt.secret deve essere lungo almeno 32 caratteri");
        }
        this.key = Keys.hmacShaKeyFor(bytes);
        this.expiration = expiration;
    }

    public String generateToken(String username) {
        Date now = new Date();
        return Jwts.builder()
                .subject(username)
                .issuedAt(now)
                .expiration(new Date(now.getTime() + expiration.toMillis()))
                .signWith(key)
                .compact();
    }

    /** Restituisce lo username se il token è valido e non scaduto. */
    public Optional<String> extractUsername(String token) {
        try {
            return Optional.ofNullable(Jwts.parser().verifyWith(key).build()
                    .parseSignedClaims(token)
                    .getPayload()
                    .getSubject());
        } catch (JwtException | IllegalArgumentException e) {
            return Optional.empty();
        }
    }
}
