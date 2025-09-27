package com.grubstack.admin.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;

@Service
public class NotificationService {

    private static final Logger logger = LoggerFactory.getLogger(NotificationService.class);
    private final RestTemplate restTemplate;

    public NotificationService() {
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(5000); // 5 seconds
        factory.setReadTimeout(10000);   // 10 seconds
        this.restTemplate = new RestTemplate(factory);
    }

    @Async
    public CompletableFuture<Void> sendAdminCreationNotification(String adminEmail, String adminName, String password, String role) {
        try {
            Map<String, Object> templateData = new HashMap<>();
            templateData.put("adminName", adminName);
            templateData.put("adminEmail", adminEmail);
            templateData.put("password", password);
            templateData.put("role", role);
            templateData.put("creationDate", java.time.LocalDateTime.now().toString());

            Map<String, Object> notification = new HashMap<>();
            notification.put("type", "ADMIN_CREATION");
            notification.put("channel", "EMAIL");
            notification.put("recipient", adminEmail);
            notification.put("subject", "Admin Account Created - GrubStack");
            notification.put("message", "Your admin account has been created. You can now login with the provided credentials.");
            notification.put("notificationId", "admin-creation-" + UUID.randomUUID().toString());
            notification.put("templateId", "admin-creation");
            notification.put("templateData", templateData);
            notification.put("priority", "NORMAL");

            restTemplate.postForObject(
                "http://localhost:8089/notifications/send",
                notification,
                Object.class
            );

            logger.info("Admin creation notification sent for admin: {}", adminEmail);
        } catch (Exception e) {
            logger.error("Failed to send admin creation notification for admin: {}", adminEmail, e);
        }
        return CompletableFuture.completedFuture(null);
    }

    @Async
    public CompletableFuture<Void> sendDeliveryAgentCreationNotification(String agentEmail, String agentName, String password, String phone) {
        try {
            Map<String, Object> templateData = new HashMap<>();
            templateData.put("agentName", agentName);
            templateData.put("agentEmail", agentEmail);
            templateData.put("password", password);
            templateData.put("phone", phone);
            templateData.put("creationDate", java.time.LocalDateTime.now().toString());

            Map<String, Object> notification = new HashMap<>();
            notification.put("type", "DELIVERY_AGENT_CREATION");
            notification.put("channel", "EMAIL");
            notification.put("recipient", agentEmail);
            notification.put("subject", "Delivery Agent Account Created - GrubStack");
            notification.put("message", "Your delivery agent account has been created. You can now login with the provided credentials.");
            notification.put("notificationId", "delivery-agent-creation-" + UUID.randomUUID().toString());
            notification.put("templateId", "delivery-agent-creation");
            notification.put("templateData", templateData);
            notification.put("priority", "NORMAL");

            restTemplate.postForObject(
                "http://localhost:8089/notifications/send",
                notification,
                Object.class
            );

            logger.info("Delivery agent creation notification sent for agent: {}", agentEmail);
        } catch (Exception e) {
            logger.error("Failed to send delivery agent creation notification for agent: {}", agentEmail, e);
        }
        return CompletableFuture.completedFuture(null);
    }

    @Async
    public CompletableFuture<Void> sendAdminWelcomeNotification(String adminEmail, String adminName, String temporaryPassword) {
        try {
            restTemplate.postForObject(
                "http://localhost:8089/notifications/admin-welcome?email={email}&adminName={name}&temporaryPassword={password}",
                null,
                Object.class,
                adminEmail,
                adminName,
                temporaryPassword
            );

            logger.info("Admin welcome notification sent for admin: {}", adminEmail);
        } catch (Exception e) {
            logger.error("Failed to send admin welcome notification for admin: {}", adminEmail, e);
        }
        return CompletableFuture.completedFuture(null);
    }

    @Async
    public CompletableFuture<Void> sendAdminAccountDeactivatedNotification(String adminEmail, String adminName, String reason) {
        try {
            restTemplate.postForObject(
                "http://localhost:8089/notifications/admin-account-deactivated?email={email}&adminName={name}&reason={reason}",
                null,
                Object.class,
                adminEmail,
                adminName,
                reason
            );

            logger.info("Admin account deactivated notification sent for admin: {}", adminEmail);
        } catch (Exception e) {
            logger.error("Failed to send admin account deactivated notification for admin: {}", adminEmail, e);
        }
        return CompletableFuture.completedFuture(null);
    }

    @Async
    public CompletableFuture<Void> sendAdminAccountReactivatedNotification(String adminEmail, String adminName) {
        try {
            restTemplate.postForObject(
                "http://localhost:8089/notifications/admin-account-reactivated?email={email}&adminName={name}",
                null,
                Object.class,
                adminEmail,
                adminName
            );

            logger.info("Admin account reactivated notification sent for admin: {}", adminEmail);
        } catch (Exception e) {
            logger.error("Failed to send admin account reactivated notification for admin: {}", adminEmail, e);
        }
        return CompletableFuture.completedFuture(null);
    }

    @Async
    public CompletableFuture<Void> sendAdminAccountDeletedNotification(String adminEmail, String adminName, String reason) {
        try {
            restTemplate.postForObject(
                "http://localhost:8089/notifications/admin-account-deleted?email={email}&adminName={name}&reason={reason}",
                null,
                Object.class,
                adminEmail,
                adminName,
                reason
            );

            logger.info("Admin account deleted notification sent for admin: {}", adminEmail);
        } catch (Exception e) {
            logger.error("Failed to send admin account deleted notification for admin: {}", adminEmail, e);
        }
        return CompletableFuture.completedFuture(null);
    }

    @Async
    public CompletableFuture<Void> sendAdminProfileUpdatedNotification(String adminEmail, String adminName, Map<String, Object> changes) {
        try {
            restTemplate.postForObject(
                "http://localhost:8089/notifications/admin-profile-updated?email={email}&adminName={name}",
                changes,
                Object.class,
                adminEmail,
                adminName
            );

            logger.info("Admin profile updated notification sent for admin: {}", adminEmail);
        } catch (Exception e) {
            logger.error("Failed to send admin profile updated notification for admin: {}", adminEmail, e);
        }
        return CompletableFuture.completedFuture(null);
    }
}







