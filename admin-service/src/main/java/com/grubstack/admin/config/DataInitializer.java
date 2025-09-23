package com.grubstack.admin.config;

import com.grubstack.admin.domain.AdminUser;
import com.grubstack.admin.repo.AdminUserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.Set;

@Component
public class DataInitializer implements CommandLineRunner {
    
    private final AdminUserRepository adminUserRepository;

    public DataInitializer(AdminUserRepository adminUserRepository) {
        this.adminUserRepository = adminUserRepository;
    }

    @Override
    public void run(String... args) throws Exception {
        // Create default admin if none exists
        if (adminUserRepository.count() == 0) {
            AdminUser defaultAdmin = new AdminUser();
            defaultAdmin.setEmail("admin@grubstack.com");
            defaultAdmin.setPasswordHash(hashPassword("admin123"));
            defaultAdmin.setFullName("System Administrator");
            defaultAdmin.setRole(AdminUser.Role.SUPER_ADMIN);
            defaultAdmin.setPermissions(Set.of(
                AdminUser.Permission.MANAGE_RESTAURANTS,
                AdminUser.Permission.MANAGE_ADMINS,
                AdminUser.Permission.MANAGE_USERS,
                AdminUser.Permission.VIEW_ANALYTICS,
                AdminUser.Permission.MANAGE_ORDERS
            ));
            defaultAdmin.setActive(true);
            
            adminUserRepository.save(defaultAdmin);
            
            // Create a sample admin
            AdminUser sampleAdmin = new AdminUser();
            sampleAdmin.setEmail("manager@grubstack.com");
            sampleAdmin.setPasswordHash(hashPassword("manager123"));
            sampleAdmin.setFullName("Restaurant Manager");
            sampleAdmin.setRole(AdminUser.Role.ADMIN);
            sampleAdmin.setPermissions(Set.of(
                AdminUser.Permission.MANAGE_RESTAURANTS,
                AdminUser.Permission.VIEW_ANALYTICS
            ));
            sampleAdmin.setActive(true);
            
            adminUserRepository.save(sampleAdmin);
            
            System.out.println("Default admin users created:");
            System.out.println("Email: admin@grubstack.com, Password: admin123");
            System.out.println("Email: manager@grubstack.com, Password: manager123");
        }
    }

    private String hashPassword(String password) {
        // Simple hash for demo purposes - in production, use a proper password hashing library
        return String.valueOf(password.hashCode());
    }
}
