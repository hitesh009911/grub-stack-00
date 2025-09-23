package com.grubstack.admin.web;

import com.grubstack.admin.domain.AdminUser;
import com.grubstack.admin.repo.AdminUserRepository;
import com.grubstack.admin.service.AdminService;
import com.grubstack.admin.service.NotificationService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

@RestController
@RequestMapping("/admin")
public class AdminController {
    private final AdminService adminService;
    private final AdminUserRepository adminUserRepository;
    private final NotificationService notificationService;

    public AdminController(AdminService adminService, AdminUserRepository adminUserRepository, NotificationService notificationService) {
        this.adminService = adminService;
        this.adminUserRepository = adminUserRepository;
        this.notificationService = notificationService;
    }

    @GetMapping("/")
    public Map<String, String> home() {
        return Map.of("service", "Admin Service", "status", "running", "version", "1.0.0");
    }

    @GetMapping("/users")
    public List<AdminUserDto> getAllAdmins() {
        return adminUserRepository.findAll().stream()
                .map(AdminUserDto::fromEntity)
                .toList();
    }

    @PostMapping("/users")
    public AdminUserDto createAdmin(@RequestBody @Valid CreateAdminRequest request) {
        AdminUser admin = adminService.createAdmin(
                request.email(),
                request.password(),
                request.fullName(),
                AdminUser.Role.valueOf(request.role()),
                request.permissions()
        );
        
        // Send admin creation notification asynchronously
        notificationService.sendAdminCreationNotification(
            admin.getEmail(),
            admin.getFullName(),
            request.password(), // Send the plain password for the email
            admin.getRole().name()
        );
        
        return AdminUserDto.fromEntity(admin);
    }

    @PutMapping("/users/{id}")
    public AdminUserDto updateAdmin(@PathVariable Long id, @RequestBody @Valid UpdateAdminRequest request) {
        AdminUser admin = adminService.updateAdmin(
                id,
                request.fullName(),
                request.role() != null ? AdminUser.Role.valueOf(request.role()) : null,
                request.permissions()
        );
        return AdminUserDto.fromEntity(admin);
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<Void> deleteAdmin(@PathVariable Long id) {
        adminService.deleteAdmin(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/users/{id}/toggle-active")
    public AdminUserDto toggleActive(@PathVariable Long id) {
        AdminUser admin = adminService.toggleActive(id);
        return AdminUserDto.fromEntity(admin);
    }

    @PostMapping("/auth/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        try {
            var adminOpt = adminUserRepository.findByEmail(request.email());
            
            if (adminOpt.isEmpty()) {
                return ResponseEntity.badRequest()
                    .body(Map.of("error", "Invalid credentials"));
            }
            
            AdminUser admin = adminOpt.get();
            
            // Check if admin is active
            if (!admin.isActive()) {
                return ResponseEntity.badRequest()
                    .body(Map.of("error", "Account is deactivated"));
            }
            
            // Simple password check (in production, use proper password hashing)
            if (!admin.getPasswordHash().equals(String.valueOf(request.password().hashCode()))) {
                return ResponseEntity.badRequest()
                    .body(Map.of("error", "Invalid credentials"));
            }
            
            // Return admin data
            Map<String, Object> response = new HashMap<>();
            response.put("id", admin.getId());
            response.put("email", admin.getEmail());
            response.put("fullName", admin.getFullName());
            response.put("role", admin.getRole().toString());
            response.put("permissions", admin.getPermissions());
            response.put("active", admin.isActive());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(Map.of("error", "Login failed: " + e.getMessage()));
        }
    }


    // DTOs
    public record AdminUserDto(
            Long id,
            String email,
            String fullName,
            String role,
            Set<String> permissions,
            boolean isActive,
            Instant createdAt,
            Instant lastLogin
    ) {
        public static AdminUserDto fromEntity(AdminUser admin) {
            return new AdminUserDto(
                    admin.getId(),
                    admin.getEmail(),
                    admin.getFullName(),
                    admin.getRole().name(),
                    admin.getPermissions().stream()
                            .map(Enum::name)
                            .collect(java.util.stream.Collectors.toSet()),
                    admin.isActive(),
                    admin.getCreatedAt(),
                    admin.getLastLogin()
            );
        }
    }

    public record CreateAdminRequest(
            @NotBlank @Email String email,
            @NotBlank String password,
            @NotBlank String fullName,
            @NotBlank String role,
            Set<String> permissions
    ) {}

    public record UpdateAdminRequest(
            String fullName,
            String role,
            Set<String> permissions
    ) {}

    public record LoginRequest(
            String email,
            String password
    ) {}

}
