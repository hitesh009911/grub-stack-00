package com.grubstack.delivery.web;

import com.grubstack.delivery.domain.DeliveryAgent;
import com.grubstack.delivery.repo.DeliveryAgentRepository;
import com.grubstack.delivery.service.DeliveryService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/auth")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173", "http://localhost:8081"})
public class AuthController {
    
    private final DeliveryAgentRepository agentRepo;
    private final BCryptPasswordEncoder passwordEncoder;
    
    public AuthController(DeliveryAgentRepository agentRepo) {
        this.agentRepo = agentRepo;
        this.passwordEncoder = new BCryptPasswordEncoder();
    }
    
    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request) {
        try {
            Optional<DeliveryAgent> agentOpt = agentRepo.findByEmail(request.email());
            if (agentOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("error", "Invalid credentials"));
            }
            
            DeliveryAgent agent = agentOpt.get();
            if (!passwordEncoder.matches(request.password(), agent.getPasswordHash())) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("error", "Invalid credentials"));
            }
            
            // Update last active time
            agent.setLastActiveAt(java.time.Instant.now());
            agentRepo.save(agent);
            
            // Return agent data (without password hash)
            AgentResponse response = new AgentResponse(
                agent.getId(),
                agent.getEmail(),
                agent.getName(),
                agent.getPhone(),
                agent.getStatus().toString(),
                agent.getVehicleType(),
                agent.getLicenseNumber()
            );
            
            return ResponseEntity.ok(response);
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Login failed"));
        }
    }
    
    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest request) {
        try {
            if (agentRepo.findByEmail(request.email()).isPresent()) {
                return ResponseEntity.status(HttpStatus.CONFLICT)
                        .body(Map.of("error", "Agent with this email already exists"));
            }
            
            String passwordHash = passwordEncoder.encode(request.password());
            DeliveryAgent agent = new DeliveryAgent(
                request.name(),
                request.email(),
                request.phone(),
                request.vehicleType(),
                request.licenseNumber(),
                passwordHash
            );
            
            DeliveryAgent savedAgent = agentRepo.save(agent);
            
            AgentResponse response = new AgentResponse(
                savedAgent.getId(),
                savedAgent.getEmail(),
                savedAgent.getName(),
                savedAgent.getPhone(),
                savedAgent.getStatus().toString(),
                savedAgent.getVehicleType(),
                savedAgent.getLicenseNumber()
            );
            
            return ResponseEntity.ok(response);
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Registration failed"));
        }
    }
    
    // DTOs
    public record LoginRequest(String email, String password) {}
    
    public record RegisterRequest(
        String name,
        String email,
        String password,
        String phone,
        String vehicleType,
        String licenseNumber
    ) {}
    
    public record AgentResponse(
        Long id,
        String email,
        String name,
        String phone,
        String status,
        String vehicleType,
        String licenseNumber
    ) {}
}

