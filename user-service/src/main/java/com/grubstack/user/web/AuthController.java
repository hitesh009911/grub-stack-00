package com.grubstack.user.web;

import com.grubstack.user.service.AuthService;
import com.grubstack.user.web.dto.AuthDtos;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/auth")
public class AuthController {
	private final AuthService authService;

	public AuthController(AuthService authService) { this.authService = authService; }

	@PostMapping("/register")
	public ResponseEntity<?> register(@Valid @RequestBody AuthDtos.RegisterRequest req) {
		try {
			AuthDtos.UserResponse response = authService.register(req);
			return ResponseEntity.ok(response);
		} catch (IllegalArgumentException ex) {
			String message = ex.getMessage();
			HttpStatus status = message.contains("Email already registered") ? 
				HttpStatus.CONFLICT : HttpStatus.BAD_REQUEST;
			return ResponseEntity.status(status)
					.body(Map.of("error", message));
		}
	}

	@PostMapping("/login")
	public ResponseEntity<?> login(@Valid @RequestBody AuthDtos.LoginRequest req) {
		try {
			AuthDtos.UserResponse response = authService.login(req);
			return ResponseEntity.ok(response);
		} catch (IllegalArgumentException ex) {
			return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
					.body(Map.of("error", ex.getMessage()));
		}
	}
}


