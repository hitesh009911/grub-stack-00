package com.grubstack.notification.web;

import com.grubstack.notification.domain.Notification;
import com.grubstack.notification.model.NotificationRequest;
import com.grubstack.notification.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import jakarta.mail.Session;
import jakarta.mail.Transport;
import jakarta.mail.Authenticator;
import jakarta.mail.PasswordAuthentication;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/notifications")
@CrossOrigin(origins = {"http://localhost:8081", "http://localhost:3000", "http://localhost:5173"})
public class NotificationController {
    
    @Autowired
    private NotificationService notificationService;
    
    @PostMapping("/send")
    public ResponseEntity<Map<String, String>> sendNotification(@Valid @RequestBody NotificationRequest request) {
        try {
            notificationService.sendDirectNotification(request);
            return ResponseEntity.ok(Map.of(
                "status", "success",
                "message", "Notification sent successfully",
                "notificationId", request.getNotificationId() != null ? request.getNotificationId() : "unknown"
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "status", "error",
                "message", "Failed to send notification: " + e.getMessage()
            ));
        }
    }
    
    @PostMapping("/test/email")
    public ResponseEntity<Map<String, String>> sendTestEmail(@RequestParam String email) {
        try {
            NotificationRequest testNotification = new NotificationRequest(
                NotificationRequest.NotificationType.SYSTEM_ALERT,
                NotificationRequest.NotificationChannel.EMAIL,
                email,
                "GrubStack Test Email",
                "This is a test email from GrubStack notification service."
            );
            testNotification.setNotificationId("test-" + System.currentTimeMillis());
            
            notificationService.sendDirectNotification(testNotification);
            
            return ResponseEntity.ok(Map.of(
                "status", "success",
                "message", "Test email sent successfully to " + email
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "status", "error",
                "message", "Failed to send test email: " + e.getMessage(),
                "error", e.getClass().getSimpleName()
            ));
        }
    }
    
    @PostMapping("/welcome-email")
    public ResponseEntity<Map<String, String>> sendWelcomeEmail(
            @RequestParam String email,
            @RequestParam String userName) {
        try {
            // Use the new sendWelcomeEmail method (similar to order confirmation)
            notificationService.sendWelcomeEmail(email, userName);
            
            return ResponseEntity.ok(Map.of(
                "status", "success",
                "message", "Welcome email sent successfully to " + email
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "status", "error",
                "message", "Failed to send welcome email: " + e.getMessage(),
                "error", e.getClass().getSimpleName()
            ));
        }
    }
    
    @PostMapping("/delivery-agent-registration")
    public ResponseEntity<Map<String, String>> sendDeliveryAgentRegistrationEmail(
            @RequestParam String email,
            @RequestParam String agentName,
            @RequestParam String phone,
            @RequestParam String vehicleType) {
        try {
            notificationService.sendDeliveryAgentRegistrationAcknowledgment(email, agentName, phone, vehicleType);
            
            return ResponseEntity.ok(Map.of(
                "status", "success",
                "message", "Delivery agent registration email sent successfully to " + email
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "status", "error",
                "message", "Failed to send registration email: " + e.getMessage(),
                "error", e.getClass().getSimpleName()
            ));
        }
    }
    
    @PostMapping("/delivery-agent-approval")
    public ResponseEntity<Map<String, String>> sendDeliveryAgentApprovalEmail(
            @RequestParam String email,
            @RequestParam String agentName,
            @RequestParam String loginPassword) {
        try {
            notificationService.sendDeliveryAgentApprovalNotification(email, agentName, loginPassword);
            
            return ResponseEntity.ok(Map.of(
                "status", "success",
                "message", "Delivery agent approval email sent successfully to " + email
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "status", "error",
                "message", "Failed to send approval email: " + e.getMessage(),
                "error", e.getClass().getSimpleName()
            ));
        }
    }
    
    @PostMapping("/delivery-agent-rejection")
    public ResponseEntity<Map<String, String>> sendDeliveryAgentRejectionEmail(
            @RequestParam String email,
            @RequestParam String agentName,
            @RequestParam String reason) {
        try {
            notificationService.sendDeliveryAgentRejectionNotification(email, agentName, reason);
            
            return ResponseEntity.ok(Map.of(
                "status", "success",
                "message", "Delivery agent rejection email sent successfully to " + email
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "status", "error",
                "message", "Failed to send rejection email: " + e.getMessage(),
                "error", e.getClass().getSimpleName()
            ));
        }
    }
    
    @PostMapping("/test/smtp")
    public ResponseEntity<Map<String, String>> testSmtpConnection() {
        try {
            // Test SMTP connection directly
            java.util.Properties props = new java.util.Properties();
            props.put("mail.smtp.host", "smtp.gmail.com");
            props.put("mail.smtp.port", "587");
            props.put("mail.smtp.auth", "true");
            props.put("mail.smtp.starttls.enable", "true");
            props.put("mail.smtp.starttls.required", "true");
            props.put("mail.smtp.ssl.trust", "smtp.gmail.com");
            props.put("mail.smtp.connectiontimeout", "10000");
            props.put("mail.smtp.timeout", "10000");
            props.put("mail.smtp.writetimeout", "10000");
            props.put("mail.smtp.debug", "true");
            
            Session session = Session.getInstance(props, 
                new Authenticator() {
                    protected PasswordAuthentication getPasswordAuthentication() {
                        return new PasswordAuthentication("synechronhealth@gmail.com", "zcmpswduzyhhusxz");
                    }
                });
            Transport transport = session.getTransport("smtp");
            transport.connect("smtp.gmail.com", 587, "synechronhealth@gmail.com", "zcmpswduzyhhusxz");
            transport.close();
            
            return ResponseEntity.ok(Map.of(
                "status", "success",
                "message", "SMTP connection test successful"
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "status", "error",
                "message", "SMTP connection failed: " + e.getMessage(),
                "error", e.getClass().getSimpleName()
            ));
        }
    }
    
    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> health() {
        return ResponseEntity.ok(Map.of(
            "status", "UP",
            "service", "notification-service",
            "timestamp", String.valueOf(System.currentTimeMillis())
        ));
    }
    
    // Get notification by ID
    @GetMapping("/{notificationId}")
    public ResponseEntity<Notification> getNotification(@PathVariable String notificationId) {
        Optional<Notification> notification = notificationService.getNotificationById(notificationId);
        return notification.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    // Get notifications by user ID
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Notification>> getNotificationsByUser(@PathVariable Long userId) {
        List<Notification> notifications = notificationService.getNotificationsByUserId(userId);
        return ResponseEntity.ok(notifications);
    }
    
    // Get notifications by status
    @GetMapping("/status/{status}")
    public ResponseEntity<List<Notification>> getNotificationsByStatus(@PathVariable String status) {
        try {
            Notification.NotificationStatus notificationStatus = Notification.NotificationStatus.valueOf(status.toUpperCase());
            List<Notification> notifications = notificationService.getNotificationsByStatus(notificationStatus);
            return ResponseEntity.ok(notifications);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    // Get failed notifications for retry
    @GetMapping("/failed/retry")
    public ResponseEntity<List<Notification>> getFailedNotificationsForRetry() {
        List<Notification> notifications = notificationService.getFailedNotificationsForRetry();
        return ResponseEntity.ok(notifications);
    }
    
    // Retry failed notification
    @PostMapping("/{notificationId}/retry")
    public ResponseEntity<Map<String, String>> retryNotification(@PathVariable Long notificationId) {
        try {
            notificationService.retryNotification(notificationId);
            return ResponseEntity.ok(Map.of(
                "status", "success",
                "message", "Notification retry initiated"
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "status", "error",
                "message", "Failed to retry notification: " + e.getMessage()
            ));
        }
    }
    
    // Get notification statistics
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getNotificationStats() {
        try {
            long totalNotifications = notificationService.getTotalNotificationCount();
            long pendingNotifications = notificationService.getNotificationCountByStatus(Notification.NotificationStatus.PENDING);
            long sentNotifications = notificationService.getNotificationCountByStatus(Notification.NotificationStatus.SENT);
            long deliveredNotifications = notificationService.getNotificationCountByStatus(Notification.NotificationStatus.DELIVERED);
            long failedNotifications = notificationService.getNotificationCountByStatus(Notification.NotificationStatus.FAILED);
            
            Map<String, Object> stats = Map.of(
                "total", totalNotifications,
                "pending", pendingNotifications,
                "sent", sentNotifications,
                "delivered", deliveredNotifications,
                "failed", failedNotifications
            );
            
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "error", "Failed to get notification statistics: " + e.getMessage()
            ));
        }
    }
    
    @PostMapping("/delivery-agent-deletion")
    public ResponseEntity<Map<String, String>> sendDeliveryAgentDeletionEmail(
            @RequestParam String email, 
            @RequestParam String agentName, 
            @RequestParam String reason) {
        try {
            notificationService.sendDeliveryAgentDeletionNotification(email, agentName, reason);
            return ResponseEntity.ok(Map.of(
                "status", "success",
                "message", "Delivery agent deletion email sent successfully to " + email
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "status", "error",
                "message", "Failed to send deletion email: " + e.getMessage(),
                "error", e.getClass().getSimpleName()
            ));
        }
    }
    
    // Admin notification endpoints
    @PostMapping("/admin-welcome")
    public ResponseEntity<Map<String, String>> sendAdminWelcomeEmail(
            @RequestParam String email, 
            @RequestParam String adminName, 
            @RequestParam String temporaryPassword) {
        try {
            notificationService.sendAdminWelcomeNotification(email, adminName, temporaryPassword);
            return ResponseEntity.ok(Map.of(
                "status", "success",
                "message", "Admin welcome email sent successfully to " + email
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "status", "error",
                "message", "Failed to send admin welcome email: " + e.getMessage(),
                "error", e.getClass().getSimpleName()
            ));
        }
    }
    
    @PostMapping("/admin-account-deactivated")
    public ResponseEntity<Map<String, String>> sendAdminAccountDeactivatedEmail(
            @RequestParam String email, 
            @RequestParam String adminName, 
            @RequestParam String reason) {
        try {
            notificationService.sendAdminAccountDeactivatedNotification(email, adminName, reason);
            return ResponseEntity.ok(Map.of(
                "status", "success",
                "message", "Admin account deactivated email sent successfully to " + email
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "status", "error",
                "message", "Failed to send admin deactivated email: " + e.getMessage(),
                "error", e.getClass().getSimpleName()
            ));
        }
    }
    
    @PostMapping("/admin-account-reactivated")
    public ResponseEntity<Map<String, String>> sendAdminAccountReactivatedEmail(
            @RequestParam String email, 
            @RequestParam String adminName) {
        try {
            notificationService.sendAdminAccountReactivatedNotification(email, adminName);
            return ResponseEntity.ok(Map.of(
                "status", "success",
                "message", "Admin account reactivated email sent successfully to " + email
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "status", "error",
                "message", "Failed to send admin reactivated email: " + e.getMessage(),
                "error", e.getClass().getSimpleName()
            ));
        }
    }
    
    @PostMapping("/admin-account-deleted")
    public ResponseEntity<Map<String, String>> sendAdminAccountDeletedEmail(
            @RequestParam String email, 
            @RequestParam String adminName, 
            @RequestParam String reason) {
        try {
            notificationService.sendAdminAccountDeletedNotification(email, adminName, reason);
            return ResponseEntity.ok(Map.of(
                "status", "success",
                "message", "Admin account deleted email sent successfully to " + email
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "status", "error",
                "message", "Failed to send admin deleted email: " + e.getMessage(),
                "error", e.getClass().getSimpleName()
            ));
        }
    }
    
    @PostMapping("/admin-profile-updated")
    public ResponseEntity<Map<String, String>> sendAdminProfileUpdatedEmail(
            @RequestParam String email, 
            @RequestParam String adminName,
            @RequestBody Map<String, Object> changes) {
        try {
            notificationService.sendAdminProfileUpdatedNotification(email, adminName, changes);
            return ResponseEntity.ok(Map.of(
                "status", "success",
                "message", "Admin profile updated email sent successfully to " + email
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "status", "error",
                "message", "Failed to send admin profile updated email: " + e.getMessage(),
                "error", e.getClass().getSimpleName()
            ));
        }
    }
    
    @PostMapping("/restaurant-registration-acknowledgment")
    public ResponseEntity<Map<String, String>> sendRestaurantRegistrationAcknowledgmentEmail(
            @RequestParam String email,
            @RequestParam String restaurantName,
            @RequestParam String ownerName,
            @RequestParam String phone,
            @RequestParam String address) {
        try {
            notificationService.sendRestaurantRegistrationAcknowledgment(email, restaurantName, ownerName, phone, address);
            return ResponseEntity.ok(Map.of(
                "status", "success",
                "message", "Restaurant registration acknowledgment email sent successfully to " + email
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "status", "error",
                "message", "Failed to send restaurant registration acknowledgment email: " + e.getMessage(),
                "error", e.getClass().getSimpleName()
            ));
        }
    }
    
    @PostMapping("/restaurant-approved")
    public ResponseEntity<Map<String, String>> sendRestaurantApprovedEmail(
            @RequestParam String email,
            @RequestParam String restaurantName,
            @RequestParam String ownerName,
            @RequestParam String password) {
        try {
            notificationService.sendRestaurantApprovedNotification(email, restaurantName, ownerName, password);
            return ResponseEntity.ok(Map.of(
                "status", "success",
                "message", "Restaurant approved email sent successfully to " + email
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "status", "error",
                "message", "Failed to send restaurant approved email: " + e.getMessage(),
                "error", e.getClass().getSimpleName()
            ));
        }
    }
    
    @PostMapping("/restaurant-deleted")
    public ResponseEntity<Map<String, String>> sendRestaurantDeletedEmail(
            @RequestParam String email,
            @RequestParam String restaurantName,
            @RequestParam String ownerName,
            @RequestParam String reason) {
        try {
            notificationService.sendRestaurantDeletedNotification(email, restaurantName, ownerName, reason);
            return ResponseEntity.ok(Map.of(
                "status", "success",
                "message", "Restaurant deleted email sent successfully to " + email
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "status", "error",
                "message", "Failed to send restaurant deleted email: " + e.getMessage(),
                "error", e.getClass().getSimpleName()
            ));
        }
    }
}