package com.grubstack.delivery.event;

import com.fasterxml.jackson.annotation.JsonProperty;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.HashMap;
import java.util.Map;

@Service
public class DeliveryEventPublisher {
    
    private static final Logger logger = LoggerFactory.getLogger(DeliveryEventPublisher.class);
    
    @Autowired
    private KafkaTemplate<String, Object> kafkaTemplate;
    
    private static final String DELIVERY_EVENTS_TOPIC = "delivery-events";
    private static final String DELIVERY_STATUS_UPDATES_TOPIC = "delivery-status-updates";
    
    public void publishDeliveryCreated(Long deliveryId, Long orderId, Long restaurantId, Long customerId,
                                     String pickupAddress, String deliveryAddress, Double estimatedTime) {
        Map<String, Object> event = new HashMap<>();
        event.put("eventType", "DELIVERY_CREATED");
        event.put("deliveryId", deliveryId);
        event.put("orderId", orderId);
        event.put("restaurantId", restaurantId);
        event.put("customerId", customerId);
        event.put("status", "PENDING");
        event.put("pickupAddress", pickupAddress);
        event.put("deliveryAddress", deliveryAddress);
        event.put("estimatedDeliveryTime", estimatedTime);
        event.put("timestamp", Instant.now());
        
        publishEvent(DELIVERY_EVENTS_TOPIC, deliveryId.toString(), event);
        logger.info("Published delivery created event: {}", event);
    }
    
    public void publishDeliveryAssigned(Long deliveryId, Long orderId, Long customerId, Long agentId,
                                      String agentName, String agentPhone, String status) {
        Map<String, Object> event = new HashMap<>();
        event.put("eventType", "DELIVERY_ASSIGNED");
        event.put("deliveryId", deliveryId);
        event.put("orderId", orderId);
        event.put("customerId", customerId);
        event.put("agentId", agentId);
        event.put("agentName", agentName);
        event.put("agentPhone", agentPhone);
        event.put("status", status);
        event.put("timestamp", Instant.now());
        
        publishEvent(DELIVERY_EVENTS_TOPIC, deliveryId.toString(), event);
        publishEvent(DELIVERY_STATUS_UPDATES_TOPIC, deliveryId.toString(), event);
        logger.info("Published delivery assigned event: {}", event);
    }
    
    public void publishDeliveryStatusUpdate(Long deliveryId, Long orderId, Long customerId, String status,
                                          String agentName, String agentPhone, Double estimatedTime) {
        Map<String, Object> event = new HashMap<>();
        event.put("eventType", "DELIVERY_STATUS_UPDATED");
        event.put("deliveryId", deliveryId);
        event.put("orderId", orderId);
        event.put("customerId", customerId);
        event.put("status", status);
        event.put("agentName", agentName);
        event.put("agentPhone", agentPhone);
        event.put("estimatedDeliveryTime", estimatedTime);
        event.put("timestamp", Instant.now());
        
        publishEvent(DELIVERY_STATUS_UPDATES_TOPIC, deliveryId.toString(), event);
        logger.info("Published delivery status update event: {}", event);
    }
    
    public void publishDeliveryCompleted(Long deliveryId, Long orderId, Long customerId, String agentName) {
        Map<String, Object> event = new HashMap<>();
        event.put("eventType", "DELIVERY_COMPLETED");
        event.put("deliveryId", deliveryId);
        event.put("orderId", orderId);
        event.put("customerId", customerId);
        event.put("status", "DELIVERED");
        event.put("agentName", agentName);
        event.put("timestamp", Instant.now());
        
        publishEvent(DELIVERY_EVENTS_TOPIC, deliveryId.toString(), event);
        publishEvent(DELIVERY_STATUS_UPDATES_TOPIC, deliveryId.toString(), event);
        logger.info("Published delivery completed event: {}", event);
    }
    
    public void publishDeliveryCancelled(Long deliveryId, Long orderId, Long customerId, String reason) {
        Map<String, Object> event = new HashMap<>();
        event.put("eventType", "DELIVERY_CANCELLED");
        event.put("deliveryId", deliveryId);
        event.put("orderId", orderId);
        event.put("customerId", customerId);
        event.put("status", "CANCELLED");
        event.put("timestamp", Instant.now());
        
        Map<String, Object> metadata = new HashMap<>();
        metadata.put("reason", reason);
        event.put("metadata", metadata);
        
        publishEvent(DELIVERY_EVENTS_TOPIC, deliveryId.toString(), event);
        publishEvent(DELIVERY_STATUS_UPDATES_TOPIC, deliveryId.toString(), event);
        logger.info("Published delivery cancelled event: {}", event);
    }
    
    private void publishEvent(String topic, String key, Object event) {
        try {
            kafkaTemplate.send(topic, key, event);
            logger.debug("Event published to topic {} with key {}: {}", topic, key, event);
        } catch (Exception e) {
            logger.error("Error publishing event to topic {} with key {}: {}", topic, key, event, e);
            // TODO: Implement retry mechanism or dead letter queue
        }
    }
}
