package com.grubstack.order.service;

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
    public CompletableFuture<Void> sendOrderPlacedNotification(Long orderId, Long userId, String customerEmail, String restaurantName, Integer totalCents) {
        try {
            Map<String, Object> templateData = new HashMap<>();
            templateData.put("orderId", orderId);
            templateData.put("customerName", "Customer"); // You might want to fetch this from user service
            templateData.put("restaurantName", restaurantName);
            templateData.put("totalAmount", String.format("%.2f", totalCents / 100.0));
            templateData.put("orderDate", java.time.LocalDateTime.now().toString());

            Map<String, Object> notification = new HashMap<>();
            notification.put("type", "ORDER_CONFIRMATION");
            notification.put("channel", "EMAIL");
            notification.put("recipient", customerEmail);
            notification.put("subject", "Order Confirmed - Order #" + orderId);
            notification.put("message", "Your order has been placed successfully and is being prepared by " + restaurantName + ".");
            notification.put("notificationId", "order-placed-" + orderId + "-" + UUID.randomUUID().toString());
            notification.put("templateId", "order-placed");
            notification.put("templateData", templateData);
            notification.put("priority", "NORMAL");

            restTemplate.postForObject(
                "http://localhost:8089/notifications/send",
                notification,
                Object.class
            );
            
            logger.info("Order placed notification sent for order: {}", orderId);
        } catch (Exception e) {
            logger.error("Failed to send order placed notification for order: {}", orderId, e);
        }
        return CompletableFuture.completedFuture(null);
    }

    @Async
    public CompletableFuture<Void> sendOrderPickedUpNotification(Long orderId, Long userId, String customerEmail, String deliveryAgentName) {
        try {
            Map<String, Object> templateData = new HashMap<>();
            templateData.put("orderId", orderId);
            templateData.put("customerName", "Customer");
            templateData.put("deliveryAgentName", deliveryAgentName);
            templateData.put("pickupTime", java.time.LocalDateTime.now().toString());

            Map<String, Object> notification = new HashMap<>();
            notification.put("type", "DELIVERY_PICKED_UP");
            notification.put("channel", "EMAIL");
            notification.put("recipient", customerEmail);
            notification.put("subject", "Order Picked Up - Order #" + orderId);
            notification.put("message", "Your order has been picked up by " + deliveryAgentName + " and is on its way to you!");
            notification.put("notificationId", "order-picked-up-" + orderId + "-" + UUID.randomUUID().toString());
            notification.put("templateId", "order-picked-up");
            notification.put("templateData", templateData);
            notification.put("priority", "NORMAL");

            restTemplate.postForObject(
                "http://localhost:8089/notifications/send",
                notification,
                Object.class
            );
            
            logger.info("Order picked up notification sent for order: {}", orderId);
        } catch (Exception e) {
            logger.error("Failed to send order picked up notification for order: {}", orderId, e);
        }
        return CompletableFuture.completedFuture(null);
    }

    @Async
    public CompletableFuture<Void> sendOrderDeliveredNotification(Long orderId, Long userId, String customerEmail, String deliveryAgentName) {
        try {
            Map<String, Object> templateData = new HashMap<>();
            templateData.put("orderId", orderId);
            templateData.put("customerName", "Customer");
            templateData.put("deliveryAgentName", deliveryAgentName);
            templateData.put("deliveryTime", java.time.LocalDateTime.now().toString());

            Map<String, Object> notification = new HashMap<>();
            notification.put("type", "DELIVERY_DELIVERED");
            notification.put("channel", "EMAIL");
            notification.put("recipient", customerEmail);
            notification.put("subject", "Order Delivered - Order #" + orderId);
            notification.put("message", "Your order has been successfully delivered by " + deliveryAgentName + ". Enjoy your meal!");
            notification.put("notificationId", "order-delivered-" + orderId + "-" + UUID.randomUUID().toString());
            notification.put("templateId", "order-delivered");
            notification.put("templateData", templateData);
            notification.put("priority", "NORMAL");

            restTemplate.postForObject(
                "http://localhost:8089/notifications/send",
                notification,
                Object.class
            );
            
            logger.info("Order delivered notification sent for order: {}", orderId);
        } catch (Exception e) {
            logger.error("Failed to send order delivered notification for order: {}", orderId, e);
        }
        return CompletableFuture.completedFuture(null);
    }
}
