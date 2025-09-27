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
            // Create notification data
            Map<String, Object> templateData = new HashMap<>();
            templateData.put("userName", userName);
            templateData.put("userEmail", userEmail);
            templateData.put("registrationDate", java.time.LocalDateTime.now().toString());

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
            
            // Send welcome email using the new endpoint (similar to order confirmation)
            try {
                String url = "http://localhost:8089/notifications/welcome-email?email=" + 
                           userEmail + 
                           "&userName=" + java.net.URLEncoder.encode(userName, "UTF-8");
                
                String response = restTemplate.postForObject(url, null, String.class);
                System.out.println("Welcome email sent successfully for user: " + userId);
                System.out.println("Response: " + response);
            } catch (Exception e) {
                System.err.println("Error sending welcome email: " + e.getMessage());
                e.printStackTrace();
            }
        } catch (Exception e) {
            System.err.println("Failed to send welcome email for user " + userId + ": " + e.getMessage());
            e.printStackTrace();
        }
        return CompletableFuture.completedFuture(null);
    }
}

