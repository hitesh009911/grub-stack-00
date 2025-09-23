package com.grubstack.order.service;

import com.grubstack.order.domain.OrderEntity;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.concurrent.CompletableFuture;

@Service
public class DeliveryService {
    private final RestTemplate restTemplate;

    public DeliveryService() {
        // Configure RestTemplate with timeout settings
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(5000); // 5 seconds
        factory.setReadTimeout(10000);   // 10 seconds
        this.restTemplate = new RestTemplate(factory);
    }

    @Async
    public CompletableFuture<Void> createDeliveryAsync(OrderEntity order) {
        try {
            createDelivery(order);
        } catch (Exception e) {
            // Log error but don't fail the order
            System.err.println("Failed to create delivery for order " + order.getId() + ": " + e.getMessage());
        }
        return CompletableFuture.completedFuture(null);
    }
    
    private void createDelivery(OrderEntity order) {
        // Create delivery request
        DeliveryRequest deliveryRequest = new DeliveryRequest(
            order.getId(),
            order.getRestaurantId(),
            order.getUserId(),
            "Restaurant Address", // In real app, get from restaurant service
            "Customer Address"    // In real app, get from user service
        );
        
        // Call delivery service
        restTemplate.postForObject(
            "http://localhost:8086/deliveries",
            deliveryRequest,
            Object.class
        );
    }
    
    private record DeliveryRequest(
        Long orderId,
        Long restaurantId,
        Long customerId,
        String pickupAddress,
        String deliveryAddress
    ) {}
}

