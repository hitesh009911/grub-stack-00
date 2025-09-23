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
}
