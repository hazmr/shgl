package org.oji.shgl.dto;


import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record ContactRequestDto(
        @Email
        @NotBlank
        String email,

        @NotBlank
        String message,

        @NotBlank
        String name,

        @NotBlank
        String subject,

        @NotBlank
        String userType
){}