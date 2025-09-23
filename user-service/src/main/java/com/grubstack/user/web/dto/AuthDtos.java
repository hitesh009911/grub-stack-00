package com.grubstack.user.web.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

import java.util.Set;

public class AuthDtos {
	public record RegisterRequest(
			@Email @NotBlank String email,
			@NotBlank String password,
			@NotBlank String fullName,
			Set<String> roles
	) {}

	public record LoginRequest(
			@Email @NotBlank String email,
			@NotBlank String password
	) {}

	public record UserResponse(Long id, String email, String fullName, Set<String> roles) {}
}


