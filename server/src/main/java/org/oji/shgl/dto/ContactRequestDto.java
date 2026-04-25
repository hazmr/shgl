package org.oji.shgl.dto;


public record ContactRequestDto(String email, String message, String name, String subject, String userType) {
}