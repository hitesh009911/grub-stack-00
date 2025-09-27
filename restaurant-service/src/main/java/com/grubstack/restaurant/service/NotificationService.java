package com.grubstack.restaurant.service;

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
    public CompletableFuture<Void> sendRestaurantRegistrationNotification(Long restaurantId, String restaurantName, String ownerName, String ownerEmail, String restaurantEmail) {
        try {
            Map<String, Object> templateData = new HashMap<>();
            templateData.put("restaurantId", restaurantId);
            templateData.put("restaurantName", restaurantName);
            templateData.put("ownerName", ownerName);
            templateData.put("restaurantEmail", restaurantEmail);
            templateData.put("registrationDate", java.time.LocalDateTime.now().toString());

            Map<String, Object> notification = new HashMap<>();
            notification.put("type", "RESTAURANT_REGISTRATION");
            notification.put("channel", "EMAIL");
            notification.put("recipient", ownerEmail);
            notification.put("subject", "Restaurant Registration Confirmation - " + restaurantName);
            notification.put("message", "Thank you for registering your restaurant with GrubStack. Your application is under review.");
            notification.put("notificationId", "restaurant-registration-" + restaurantId + "-" + UUID.randomUUID().toString());
            notification.put("templateId", "restaurant-registration");
            notification.put("templateData", templateData);
            notification.put("priority", "NORMAL");

            restTemplate.postForObject(
                "http://localhost:8089/notifications/send",
                notification,
                Object.class
            );

            logger.info("Restaurant registration notification sent for restaurant: {}", restaurantId);
        } catch (Exception e) {
            logger.error("Failed to send restaurant registration notification for restaurant: {}", restaurantId, e);
        }
        return CompletableFuture.completedFuture(null);
    }

    @Async
    public CompletableFuture<Void> sendRestaurantApprovalNotification(Long restaurantId, String restaurantName, String ownerName, String ownerEmail) {
        try {
            Map<String, Object> templateData = new HashMap<>();
            templateData.put("restaurantId", restaurantId);
            templateData.put("restaurantName", restaurantName);
            templateData.put("ownerName", ownerName);
            templateData.put("approvalDate", java.time.LocalDateTime.now().toString());

            Map<String, Object> notification = new HashMap<>();
            notification.put("type", "RESTAURANT_APPROVAL");
            notification.put("channel", "EMAIL");
            notification.put("recipient", ownerEmail);
            notification.put("subject", "Restaurant Approved - " + restaurantName);
            notification.put("message", "Congratulations! Your restaurant has been approved. You can now login and start accepting orders.");
            notification.put("notificationId", "restaurant-approval-" + restaurantId + "-" + UUID.randomUUID().toString());
            notification.put("templateId", "restaurant-approval");
            notification.put("templateData", templateData);
            notification.put("priority", "NORMAL");

            restTemplate.postForObject(
                "http://localhost:8089/notifications/send",
                notification,
                Object.class
            );

            logger.info("Restaurant approval notification sent for restaurant: {}", restaurantId);
        } catch (Exception e) {
            logger.error("Failed to send restaurant approval notification for restaurant: {}", restaurantId, e);
        }
        return CompletableFuture.completedFuture(null);
    }
}







