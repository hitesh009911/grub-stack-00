package com.grubstack.notification.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.time.Instant;
import java.util.Map;

public class DeliveryEvent {
    
    @JsonProperty("eventType")
    private String eventType;
    
    @JsonProperty("deliveryId")
    private Long deliveryId;
    
    @JsonProperty("orderId")
    private Long orderId;
    
    @JsonProperty("customerId")
    private Long customerId;
    
    @JsonProperty("restaurantId")
    private Long restaurantId;
    
    @JsonProperty("status")
    private String status;
    
    @JsonProperty("agentId")
    private Long agentId;
    
    @JsonProperty("agentName")
    private String agentName;
    
    @JsonProperty("agentPhone")
    private String agentPhone;
    
    @JsonProperty("pickupAddress")
    private String pickupAddress;
    
    @JsonProperty("deliveryAddress")
    private String deliveryAddress;
    
    @JsonProperty("estimatedDeliveryTime")
    private Double estimatedDeliveryTime;
    
    @JsonProperty("timestamp")
    private Instant timestamp;
    
    @JsonProperty("metadata")
    private Map<String, Object> metadata;
    
    // Constructors
    public DeliveryEvent() {}
    
    public DeliveryEvent(String eventType, Long deliveryId, Long orderId, Long customerId, 
                        String status, Instant timestamp) {
        this.eventType = eventType;
        this.deliveryId = deliveryId;
        this.orderId = orderId;
        this.customerId = customerId;
        this.status = status;
        this.timestamp = timestamp;
    }
    
    // Getters and Setters
    public String getEventType() { return eventType; }
    public void setEventType(String eventType) { this.eventType = eventType; }
    
    public Long getDeliveryId() { return deliveryId; }
    public void setDeliveryId(Long deliveryId) { this.deliveryId = deliveryId; }
    
    public Long getOrderId() { return orderId; }
    public void setOrderId(Long orderId) { this.orderId = orderId; }
    
    public Long getCustomerId() { return customerId; }
    public void setCustomerId(Long customerId) { this.customerId = customerId; }
    
    public Long getRestaurantId() { return restaurantId; }
    public void setRestaurantId(Long restaurantId) { this.restaurantId = restaurantId; }
    
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    
    public Long getAgentId() { return agentId; }
    public void setAgentId(Long agentId) { this.agentId = agentId; }
    
    public String getAgentName() { return agentName; }
    public void setAgentName(String agentName) { this.agentName = agentName; }
    
    public String getAgentPhone() { return agentPhone; }
    public void setAgentPhone(String agentPhone) { this.agentPhone = agentPhone; }
    
    public String getPickupAddress() { return pickupAddress; }
    public void setPickupAddress(String pickupAddress) { this.pickupAddress = pickupAddress; }
    
    public String getDeliveryAddress() { return deliveryAddress; }
    public void setDeliveryAddress(String deliveryAddress) { this.deliveryAddress = deliveryAddress; }
    
    public Double getEstimatedDeliveryTime() { return estimatedDeliveryTime; }
    public void setEstimatedDeliveryTime(Double estimatedDeliveryTime) { this.estimatedDeliveryTime = estimatedDeliveryTime; }
    
    public Instant getTimestamp() { return timestamp; }
    public void setTimestamp(Instant timestamp) { this.timestamp = timestamp; }
    
    public Map<String, Object> getMetadata() { return metadata; }
    public void setMetadata(Map<String, Object> metadata) { this.metadata = metadata; }
    
    @Override
    public String toString() {
        return "DeliveryEvent{" +
                "eventType='" + eventType + '\'' +
                ", deliveryId=" + deliveryId +
                ", orderId=" + orderId +
                ", customerId=" + customerId +
                ", status='" + status + '\'' +
                ", timestamp=" + timestamp +
                '}';
    }
}
