package com.grubstack.admin.service;

import com.grubstack.admin.domain.AdminUser;
import com.grubstack.admin.repo.AdminUserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Set;

@Service
public class AdminService {
    private final AdminUserRepository adminUserRepository;

    public AdminService(AdminUserRepository adminUserRepository) {
        this.adminUserRepository = adminUserRepository;
    }

    @Transactional
    public AdminUser createAdmin(String email, String password, String fullName, 
                                AdminUser.Role role, Set<String> permissions) {
        if (adminUserRepository.existsByEmail(email)) {
            throw new IllegalArgumentException("Email already exists");
        }

        AdminUser admin = new AdminUser();
        admin.setEmail(email);
        admin.setPasswordHash(hashPassword(password));
        admin.setFullName(fullName);
        admin.setRole(role);
        
        Set<AdminUser.Permission> permissionSet = permissions.stream()
                .map(AdminUser.Permission::valueOf)
                .collect(java.util.stream.Collectors.toSet());
        admin.setPermissions(permissionSet);
        admin.setActive(true);
        admin.setCreatedAt(Instant.now());

        return adminUserRepository.save(admin);
    }

    @Transactional
    public AdminUser updateAdmin(Long id, String fullName, AdminUser.Role role, Set<String> permissions) {
        AdminUser admin = adminUserRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Admin not found"));

        if (fullName != null) {
            admin.setFullName(fullName);
        }
        
        if (role != null) {
            admin.setRole(role);
        }
        
        if (permissions != null) {
            Set<AdminUser.Permission> permissionSet = permissions.stream()
                    .map(AdminUser.Permission::valueOf)
                    .collect(java.util.stream.Collectors.toSet());
            admin.setPermissions(permissionSet);
        }

        return adminUserRepository.save(admin);
    }

    @Transactional
    public void deleteAdmin(Long id) {
        if (!adminUserRepository.existsById(id)) {
            throw new IllegalArgumentException("Admin not found");
        }
        adminUserRepository.deleteById(id);
    }

    @Transactional
    public AdminUser toggleActive(Long id) {
        AdminUser admin = adminUserRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Admin not found"));
        
        admin.setActive(!admin.isActive());
        return adminUserRepository.save(admin);
    }

    private String hashPassword(String password) {
        // Simple hash for demo purposes - in production, use a proper password hashing library
        return String.valueOf(password.hashCode());
    }
}
