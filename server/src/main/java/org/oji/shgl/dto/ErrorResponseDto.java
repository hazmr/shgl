package org.oji.shgl.dto;

import org.springframework.http.HttpStatus;

import java.time.LocalDateTime;
import java.util.List;

public record ErrorResponseDto(String path, HttpStatus status, List<String> massages, LocalDateTime timestamp) {
}
