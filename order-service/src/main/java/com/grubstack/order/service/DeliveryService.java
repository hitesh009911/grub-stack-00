package com.grubstack.order.service;

import com.grubstack.order.domain.OrderEntity;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Map;
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
        // Get restaurant address from restaurant service
        String restaurantAddress = getRestaurantAddress(order.getRestaurantId());
        String customerAddress = getCustomerAddress(order.getUserId());
        
        // Create delivery request
        DeliveryRequest deliveryRequest = new DeliveryRequest(
            order.getId(),
            order.getRestaurantId(),
            order.getUserId(),
            restaurantAddress,
            customerAddress
        );
        
        // Call delivery service
        restTemplate.postForObject(
            "http://localhost:8086/deliveries",
            deliveryRequest,
            Object.class
        );
    }
    
    private String getRestaurantAddress(Long restaurantId) {
        try {
            // Call restaurant service to get restaurant details
            String url = "http://localhost:8083/restaurants/" + restaurantId;
            Map<String, Object> restaurant = restTemplate.getForObject(url, Map.class);
            
            if (restaurant != null && restaurant.containsKey("address")) {
                return (String) restaurant.get("address");
            }
        } catch (Exception e) {
            System.err.println("Failed to get restaurant address for ID " + restaurantId + ": " + e.getMessage());
        }
        
        // Fallback to a default address if restaurant service is unavailable
        return "123 Main Street, Downtown, City - 12345";
    }
    
    private String getCustomerAddress(Long customerId) {
        try {
            // Call user service to get customer details
            String url = "http://localhost:8082/users/" + customerId;
            Map<String, Object> user = restTemplate.getForObject(url, Map.class);
            
            if (user != null && user.containsKey("address")) {
                String address = (String) user.get("address");
                if (address != null && !address.trim().isEmpty()) {
                    return address;
                }
            }
        } catch (Exception e) {
            System.err.println("Failed to get customer address for ID " + customerId + ": " + e.getMessage());
        }
        
        // Fallback to a default address if user service is unavailable or address is empty
        return "456 Oak Avenue, Uptown, City - 67890";
    }

    private record DeliveryRequest(
        Long orderId,
        Long restaurantId,
        Long customerId,
        String pickupAddress,
        String deliveryAddress
    ) {}
}








