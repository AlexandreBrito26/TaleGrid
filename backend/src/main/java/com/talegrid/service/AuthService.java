package com.talegrid.service;

import com.talegrid.dto.AuthDto;
import com.talegrid.model.User;
import com.talegrid.repository.UserRepository;
import com.talegrid.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

/**
 * Lógica de negócio para registro e autenticação de usuários.
 */
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    /**
     * Cria um novo usuário e retorna o JWT.
     *
     * @throws IllegalArgumentException se o e-mail já estiver em uso.
     */
    public AuthDto.AuthResponse register(AuthDto.RegisterRequest req) {
        if (userRepository.existsByEmail(req.email())) {
            throw new IllegalArgumentException("E-mail já cadastrado.");
        }

        User user = new User();
        user.setName(req.name());
        user.setEmail(req.email());
        user.setPassword(passwordEncoder.encode(req.password()));

        userRepository.save(user);

        String token = jwtService.generateToken(user);
        return buildResponse(token, user);
    }

    /**
     * Autentica credenciais e retorna o JWT.
     *
     * @throws org.springframework.security.core.AuthenticationException se inválido.
     */
    public AuthDto.AuthResponse login(AuthDto.LoginRequest req) {
        // Spring Security valida as credenciais; lança exceção se errado
        authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(req.email(), req.password())
        );

        User user = userRepository.findByEmail(req.email())
            .orElseThrow(() -> new IllegalStateException("Usuário não encontrado."));

        String token = jwtService.generateToken(user);
        return buildResponse(token, user);
    }

    private AuthDto.AuthResponse buildResponse(String token, User user) {
        return new AuthDto.AuthResponse(
            token,
            new AuthDto.UserInfo(user.getId(), user.getName(), user.getEmail())
        );
    }
}
