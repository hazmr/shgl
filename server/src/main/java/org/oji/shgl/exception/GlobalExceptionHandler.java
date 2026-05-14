package org.oji.shgl.exception;

import org.oji.shgl.dto.ErrorResponseDto;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.method.annotation.HandlerMethodValidationException;

import java.time.LocalDateTime;
import java.util.List;

@RestControllerAdvice
public class GlobalExceptionHandler {
    private boolean showErrorDetails = true;

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponseDto> handleMethodArgumentNotValidException(MethodArgumentNotValidException ex, WebRequest request) {
        List<String> messages = ex.getBindingResult()
                .getFieldErrors()
                .stream()
                .map(err -> err.getField() + ": " + err.getDefaultMessage())
                .toList();

        return buildResponse(request, HttpStatus.BAD_REQUEST, messages);
    }

    @ExceptionHandler(HandlerMethodValidationException.class)
    public ResponseEntity<ErrorResponseDto> handleHandlerMethodValidationException(HandlerMethodValidationException ex, WebRequest request) {
        List<String> messages = ex.getParameterValidationResults().stream().
            flatMap(r -> r.getResolvableErrors().stream()
                .map(e -> r.getMethodParameter().getParameterName() + " : " + e.getDefaultMessage())
            ).toList();

        return buildResponse(request, HttpStatus.BAD_REQUEST, messages);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponseDto> handleException(Exception ex, WebRequest request) {
        List<String> messages = showErrorDetails
                ? List.of(ex.getClass().getSimpleName() + ": " + ex.getMessage())
                : List.of("An unexpected error occurred");

        return buildResponse(request, HttpStatus.INTERNAL_SERVER_ERROR, messages);
    }


    private ResponseEntity<ErrorResponseDto> buildResponse(
            WebRequest request, HttpStatus status, List<String> messages) {

        ErrorResponseDto body = new ErrorResponseDto(
                request.getDescription(false),
                status,
                messages,
                LocalDateTime.now()
        );
        return new ResponseEntity<>(body, status);
    }
}
