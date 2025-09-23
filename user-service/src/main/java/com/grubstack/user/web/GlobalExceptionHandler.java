package com.grubstack.user.web;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, String>> handleIllegalArgumentException(IllegalArgumentException ex) {
        String message = ex.getMessage();
        HttpStatus status;
        
        if (message.contains("Email already registered")) {
            status = HttpStatus.CONFLICT; // 409
        } else if (message.contains("Invalid credentials")) {
            status = HttpStatus.UNAUTHORIZED; // 401
        } else {
            status = HttpStatus.BAD_REQUEST; // 400
        }
        
        return ResponseEntity.status(status)
                .body(Map.of("error", message));
    }
}
