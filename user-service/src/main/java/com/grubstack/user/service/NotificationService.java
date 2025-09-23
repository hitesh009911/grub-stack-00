package com.grubstack.user.service;

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

    private final RestTemplate restTemplate;

    public NotificationService() {
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(5000); // 5 seconds
        factory.setReadTimeout(10000);   // 10 seconds
        this.restTemplate = new RestTemplate(factory);
    }

    public CompletableFuture<Void> sendWelcomeEmail(Long userId, String userEmail, String userName) {
        System.out.println("=== WELCOME EMAIL DEBUG ===");
        System.out.println("User ID: " + userId);
        System.out.println("User Email: " + userEmail);
        System.out.println("User Name: " + userName);
        
        try {
            Map<String, Object> templateData = new HashMap<>();
            templateData.put("userName", userName);
            templateData.put("userEmail", userEmail);
            templateData.put("registrationDate", java.time.LocalDateTime.now());

            Map<String, Object> notification = new HashMap<>();
            notification.put("type", "WELCOME_EMAIL");
            notification.put("channel", "EMAIL");
            notification.put("recipient", userEmail);
            notification.put("subject", "Welcome to GrubStack! 🎉");
            notification.put("message", "Welcome to GrubStack! We're excited to have you on board. Start exploring amazing restaurants and place your first order!");
            notification.put("notificationId", "welcome-" + userId + "-" + UUID.randomUUID().toString());
            notification.put("templateId", "welcome-email");
            notification.put("templateData", templateData);
            notification.put("priority", "NORMAL");
            notification.put("userId", userId);

            System.out.println("Sending notification to: http://localhost:8089/notifications/send");
            System.out.println("Notification data: " + notification);
            
            Object response = restTemplate.postForObject("http://localhost:8089/notifications/send", notification, Object.class);
            System.out.println("Response received: " + response);
            System.out.println("Welcome email sent successfully for user: " + userId);
        } catch (Exception e) {
            System.err.println("Failed to send welcome email for user " + userId + ": " + e.getMessage());
            e.printStackTrace();
        }
        return CompletableFuture.completedFuture(null);
    }
}

