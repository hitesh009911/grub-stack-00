package com.grubstack.delivery.service;

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
    public CompletableFuture<Void> sendDeliveryAgentCreationNotification(String agentEmail, String agentName, String password, String phone, String vehicleType) {
        try {
            Map<String, Object> templateData = new HashMap<>();
            templateData.put("agentName", agentName);
            templateData.put("agentEmail", agentEmail);
            templateData.put("password", password);
            templateData.put("phone", phone);
            templateData.put("vehicleType", vehicleType);
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
    public CompletableFuture<Void> sendDeliveryAgentRegistrationAcknowledgment(
            String agentEmail, String agentName, String phone, String vehicleType) {
        try {
            Map<String, Object> templateData = new HashMap<>();
            templateData.put("agentName", agentName);
            templateData.put("agentEmail", agentEmail);
            templateData.put("phone", phone);
            templateData.put("vehicleType", vehicleType);
            templateData.put("registrationDate", java.time.LocalDateTime.now().toString());

            Map<String, Object> notification = new HashMap<>();
            notification.put("type", "DELIVERY_AGENT_REGISTRATION");
            notification.put("channel", "EMAIL");
            notification.put("recipient", agentEmail);
            notification.put("subject", "Application Received - GrubStack Delivery");
            notification.put("message", "Thank you for applying to join the GrubStack delivery team. Your application is under review.");
            notification.put("notificationId", "delivery-agent-registration-" + UUID.randomUUID().toString());
            notification.put("templateId", "delivery-agent-registration");
            notification.put("templateData", templateData);
            notification.put("priority", "NORMAL");

            restTemplate.postForObject(
                "http://localhost:8089/notifications/send",
                notification,
                Object.class
            );

            logger.info("Delivery agent registration acknowledgment sent for agent: {}", agentEmail);
        } catch (Exception e) {
            logger.error("Failed to send delivery agent registration acknowledgment for agent: {}", agentEmail, e);
        }
        return CompletableFuture.completedFuture(null);
    }
}








