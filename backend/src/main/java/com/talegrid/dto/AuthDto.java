package com.talegrid.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.util.UUID;

// ============================================================
// DTOs de Autenticação
// ============================================================

public class AuthDto {

    /** Body do POST /api/auth/register */
    public record RegisterRequest(
        @NotBlank(message = "Nome é obrigatório")
        @Size(max = 100)
        String name,

        @Email(message = "E-mail inválido")
        @NotBlank(message = "E-mail é obrigatório")
        String email,

        @NotBlank(message = "Senha é obrigatória")
        @Size(min = 8, message = "Senha deve ter pelo menos 8 caracteres")
        String password
    ) {}

    /** Body do POST /api/auth/login */
    public record LoginRequest(
        @Email @NotBlank
        String email,

        @NotBlank
        String password
    ) {}

    /** Response de ambos os endpoints */
    public record AuthResponse(
        String token,
        UserInfo user
    ) {}

    /** Dados do usuário retornados no response */
    public record UserInfo(
        UUID id,
        String name,
        String email
    ) {}
}
