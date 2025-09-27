package com.grubstack.user.service;

import com.grubstack.user.domain.UserAccount;
import com.grubstack.user.repo.UserAccountRepository;
import com.grubstack.user.web.dto.AuthDtos;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Set;

@Service
public class AuthService {
	private final UserAccountRepository userRepo;
	private final NotificationService notificationService;
	private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

	public AuthService(UserAccountRepository userRepo, NotificationService notificationService) {
		this.userRepo = userRepo;
		this.notificationService = notificationService;
	}

	@Transactional
	public AuthDtos.UserResponse register(AuthDtos.RegisterRequest req) {
		userRepo.findByEmail(req.email()).ifPresent(u -> {
			throw new IllegalArgumentException("Email already registered");
		});
		UserAccount user = new UserAccount();
		user.setEmail(req.email());
		user.setPasswordHash(passwordEncoder.encode(req.password()));
		user.setFullName(req.fullName());
		Set<String> roles = (req.roles() == null || req.roles().isEmpty()) ? Set.of("CUSTOMER") : req.roles();
		user.setRoles(roles);
		user.setCreatedAt(Instant.now());
		UserAccount saved = userRepo.save(user);
		
		// Send welcome email synchronously
		System.out.println("=== AUTH SERVICE DEBUG ===");
		System.out.println("User registered: " + saved.getId() + " - " + saved.getEmail() + " - " + saved.getFullName());
		System.out.println("Calling sendWelcomeEmail...");
		try {
			notificationService.sendWelcomeEmail(saved.getId(), saved.getEmail(), saved.getFullName()).get();
			System.out.println("sendWelcomeEmail completed successfully");
		} catch (Exception e) {
			System.err.println("Error sending welcome email: " + e.getMessage());
			e.printStackTrace();
		}
		
		return new AuthDtos.UserResponse(saved.getId(), saved.getEmail(), saved.getFullName(), saved.getRoles());
	}

	@Transactional(readOnly = true)
	public AuthDtos.UserResponse login(AuthDtos.LoginRequest req) {
		UserAccount user = userRepo.findByEmail(req.email())
				.orElseThrow(() -> new IllegalArgumentException("Invalid credentials"));
		if (!passwordEncoder.matches(req.password(), user.getPasswordHash())) {
			throw new IllegalArgumentException("Invalid credentials");
		}
		return new AuthDtos.UserResponse(user.getId(), user.getEmail(), user.getFullName(), user.getRoles());
	}
}


