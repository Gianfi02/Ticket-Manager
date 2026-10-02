package it.tesina.ticketmanager.service;

import it.tesina.ticketmanager.dto.LoginRequest;
import it.tesina.ticketmanager.dto.LoginResponse;
import it.tesina.ticketmanager.exception.InvalidCredentialsException;
import it.tesina.ticketmanager.model.AdminUser;
import it.tesina.ticketmanager.repository.AdminUserRepository;
import it.tesina.ticketmanager.security.JwtService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final AdminUserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(AdminUserRepository userRepository, PasswordEncoder passwordEncoder, JwtService jwtService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    public LoginResponse login(LoginRequest request) {
        AdminUser user = userRepository.findByUsername(request.username().trim())
                .filter(u -> passwordEncoder.matches(request.password(), u.getPasswordHash()))
                .orElseThrow(InvalidCredentialsException::new);
        return new LoginResponse(jwtService.generateToken(user.getUsername()), user.getUsername());
    }
}
