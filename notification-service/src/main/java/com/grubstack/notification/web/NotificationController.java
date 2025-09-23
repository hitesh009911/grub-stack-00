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
}