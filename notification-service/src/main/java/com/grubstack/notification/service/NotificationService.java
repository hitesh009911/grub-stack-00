package com.grubstack.notification.service;

import com.grubstack.notification.domain.Notification;
import com.grubstack.notification.model.DeliveryEvent;
import com.grubstack.notification.model.NotificationRequest;
import com.grubstack.notification.repository.NotificationRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Service
public class NotificationService {
    
    private static final Logger logger = LoggerFactory.getLogger(NotificationService.class);
    
    @Autowired
    private EmailService emailService;
    
    @Autowired
    private KafkaTemplate<String, NotificationRequest> kafkaTemplate;
    
    @Autowired
    private NotificationRepository notificationRepository;
    
    private static final String NOTIFICATION_EVENTS_TOPIC = "notification-events";
    
    
    public void processDeliveryEvent(DeliveryEvent event) {
        logger.info("Processing delivery event: {}", event);
        
        try {
            switch (event.getStatus()) {
                case "PENDING":
                    sendOrderConfirmation(event);
                    break;
                case "ASSIGNED":
                    sendDeliveryAssigned(event);
                    break;
                case "PICKED_UP":
                    sendDeliveryPickedUp(event);
                    break;
                case "IN_TRANSIT":
                    sendDeliveryInTransit(event);
                    break;
                case "DELIVERED":
                    sendDeliveryDelivered(event);
                    break;
                case "CANCELLED":
                    sendDeliveryCancelled(event);
                    break;
                default:
                    logger.warn("Unknown delivery status: {}", event.getStatus());
            }
        } catch (Exception e) {
            logger.error("Error processing delivery event: {}", event, e);
        }
    }
    
    private void sendOrderConfirmation(DeliveryEvent event) {
        Map<String, Object> templateData = new HashMap<>();
        templateData.put("orderId", event.getOrderId());
        templateData.put("customerId", event.getCustomerId());
        templateData.put("pickupAddress", event.getPickupAddress());
        templateData.put("deliveryAddress", event.getDeliveryAddress());
        templateData.put("estimatedTime", event.getEstimatedDeliveryTime());
        
        NotificationRequest notification = new NotificationRequest(
            NotificationRequest.NotificationType.ORDER_CONFIRMATION,
            NotificationRequest.NotificationChannel.EMAIL,
            "customer" + event.getCustomerId() + "@example.com", // Mock email
            "Order Confirmation - Order #" + event.getOrderId(),
            "Your order has been confirmed and will be prepared shortly."
        );
        
        notification.setNotificationId(UUID.randomUUID().toString());
        notification.setTemplateId("order-confirmation");
        notification.setTemplateData(templateData);
        notification.setPriority(NotificationRequest.NotificationPriority.NORMAL);
        
        sendNotification(notification);
    }
    
    private void sendDeliveryAssigned(DeliveryEvent event) {
        Map<String, Object> templateData = new HashMap<>();
        templateData.put("orderId", event.getOrderId());
        templateData.put("agentName", event.getAgentName());
        templateData.put("agentPhone", event.getAgentPhone());
        templateData.put("estimatedTime", event.getEstimatedDeliveryTime());
        
        NotificationRequest notification = new NotificationRequest(
            NotificationRequest.NotificationType.DELIVERY_ASSIGNED,
            NotificationRequest.NotificationChannel.EMAIL,
            "customer" + event.getCustomerId() + "@example.com",
            "Delivery Agent Assigned - Order #" + event.getOrderId(),
            "Your delivery agent " + event.getAgentName() + " has been assigned to your order."
        );
        
        notification.setNotificationId(UUID.randomUUID().toString());
        notification.setTemplateId("delivery-assigned");
        notification.setTemplateData(templateData);
        notification.setPriority(NotificationRequest.NotificationPriority.NORMAL);
        
        sendNotification(notification);
    }
    
    private void sendDeliveryPickedUp(DeliveryEvent event) {
        Map<String, Object> templateData = new HashMap<>();
        templateData.put("orderId", event.getOrderId());
        templateData.put("agentName", event.getAgentName());
        templateData.put("estimatedTime", event.getEstimatedDeliveryTime());
        
        NotificationRequest notification = new NotificationRequest(
            NotificationRequest.NotificationType.DELIVERY_PICKED_UP,
            NotificationRequest.NotificationChannel.EMAIL,
            "customer" + event.getCustomerId() + "@example.com",
            "Order Picked Up - Order #" + event.getOrderId(),
            "Your order has been picked up and is on its way to you!"
        );
        
        notification.setNotificationId(UUID.randomUUID().toString());
        notification.setTemplateId("delivery-picked-up");
        notification.setTemplateData(templateData);
        notification.setPriority(NotificationRequest.NotificationPriority.HIGH);
        
        sendNotification(notification);
    }
    
    private void sendDeliveryInTransit(DeliveryEvent event) {
        Map<String, Object> templateData = new HashMap<>();
        templateData.put("orderId", event.getOrderId());
        templateData.put("agentName", event.getAgentName());
        templateData.put("estimatedTime", event.getEstimatedDeliveryTime());
        
        NotificationRequest notification = new NotificationRequest(
            NotificationRequest.NotificationType.DELIVERY_IN_TRANSIT,
            NotificationRequest.NotificationChannel.EMAIL,
            "customer" + event.getCustomerId() + "@example.com",
            "Out for Delivery - Order #" + event.getOrderId(),
            "Your order is out for delivery and should arrive soon!"
        );
        
        notification.setNotificationId(UUID.randomUUID().toString());
        notification.setTemplateId("delivery-in-transit");
        notification.setTemplateData(templateData);
        notification.setPriority(NotificationRequest.NotificationPriority.HIGH);
        
        sendNotification(notification);
    }
    
    private void sendDeliveryDelivered(DeliveryEvent event) {
        Map<String, Object> templateData = new HashMap<>();
        templateData.put("orderId", event.getOrderId());
        templateData.put("agentName", event.getAgentName());
        templateData.put("deliveryTime", Instant.now());
        
        NotificationRequest notification = new NotificationRequest(
            NotificationRequest.NotificationType.DELIVERY_DELIVERED,
            NotificationRequest.NotificationChannel.EMAIL,
            "customer" + event.getCustomerId() + "@example.com",
            "Order Delivered - Order #" + event.getOrderId(),
            "Your order has been successfully delivered! Enjoy your meal!"
        );
        
        notification.setNotificationId(UUID.randomUUID().toString());
        notification.setTemplateId("delivery-delivered");
        notification.setTemplateData(templateData);
        notification.setPriority(NotificationRequest.NotificationPriority.HIGH);
        
        sendNotification(notification);
    }
    
    private void sendDeliveryCancelled(DeliveryEvent event) {
        Map<String, Object> templateData = new HashMap<>();
        templateData.put("orderId", event.getOrderId());
        templateData.put("reason", event.getMetadata() != null ? event.getMetadata().get("reason") : "Unknown");
        
        NotificationRequest notification = new NotificationRequest(
            NotificationRequest.NotificationType.DELIVERY_CANCELLED,
            NotificationRequest.NotificationChannel.EMAIL,
            "customer" + event.getCustomerId() + "@example.com",
            "Order Cancelled - Order #" + event.getOrderId(),
            "Your order has been cancelled. We apologize for any inconvenience."
        );
        
        notification.setNotificationId(UUID.randomUUID().toString());
        notification.setTemplateId("delivery-cancelled");
        notification.setTemplateData(templateData);
        notification.setPriority(NotificationRequest.NotificationPriority.URGENT);
        
        sendNotification(notification);
    }
    
    private void sendNotification(NotificationRequest notification) {
        try {
            // Send to Kafka for further processing
            kafkaTemplate.send(NOTIFICATION_EVENTS_TOPIC, notification.getNotificationId(), notification);
            logger.info("Notification sent to Kafka: {}", notification);
        } catch (Exception e) {
            logger.error("Error sending notification to Kafka: {}", notification, e);
        }
    }
    
    // Direct notification sending (for immediate processing)
    public void sendDirectNotification(NotificationRequest notification) {
        try {
            // Save notification to database
            Notification notificationEntity = saveNotificationToDatabaseInternal(notification);
            
            // Send notification based on channel
            boolean sent = false;
            String errorMessage = null;
            
            try {
                switch (notification.getChannel()) {
                    case EMAIL:
                        emailService.sendEmail(notification);
                        sent = true;
                        break;
                    case SMS:
                        // TODO: Implement SMS service
                        logger.info("SMS notification: {}", notification);
                        sent = true; // Mock success for now
                        break;
                    case PUSH_NOTIFICATION:
                        // TODO: Implement push notification service
                        logger.info("Push notification: {}", notification);
                        sent = true; // Mock success for now
                        break;
                    case IN_APP_NOTIFICATION:
                        // TODO: Implement in-app notification service
                        logger.info("In-app notification: {}", notification);
                        sent = true; // Mock success for now
                        break;
                    default:
                        logger.warn("Unknown notification channel: {}", notification.getChannel());
                        errorMessage = "Unknown notification channel: " + notification.getChannel();
                }
            } catch (Exception e) {
                errorMessage = e.getMessage();
                logger.error("Error sending notification: {}", notification, e);
            }
            
            // Update notification status
            if (sent) {
                notificationEntity.markAsSent();
            } else {
                notificationEntity.markAsFailed(errorMessage);
            }
            
            notificationRepository.save(notificationEntity);
            
        } catch (Exception e) {
            logger.error("Error processing direct notification: {}", notification, e);
        }
    }
    
    // Save notification to database (internal method without @Transactional)
    private Notification saveNotificationToDatabaseInternal(NotificationRequest request) {
        Notification notification = new Notification();
        notification.setNotificationId(request.getNotificationId() != null ? 
            request.getNotificationId() : UUID.randomUUID().toString());
        notification.setType(convertNotificationType(request.getType()));
        notification.setChannel(convertNotificationChannel(request.getChannel()));
        notification.setRecipient(request.getRecipient());
        notification.setSubject(request.getSubject());
        notification.setMessage(request.getMessage());
        notification.setTemplateId(request.getTemplateId());
        notification.setPriority(convertNotificationPriority(request.getPriority()));
        notification.setScheduledAt(request.getScheduledAt() != null ? 
            request.getScheduledAt() : Instant.now());
        
        // Set metadata if available
        if (request.getMetadata() != null) {
            // Convert metadata to JSON string (simplified)
            notification.setMetadata(request.getMetadata().toString());
        }
        
        return notificationRepository.save(notification);
    }
    
    // Public method for external use
    @Transactional
    public Notification saveNotificationToDatabase(NotificationRequest request) {
        return saveNotificationToDatabaseInternal(request);
    }
    
    // Get notification by ID
    public Optional<Notification> getNotificationById(String notificationId) {
        return notificationRepository.findByNotificationId(notificationId);
    }
    
    // Get notifications by user ID
    public List<Notification> getNotificationsByUserId(Long userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }
    
    // Get notifications by status
    public List<Notification> getNotificationsByStatus(Notification.NotificationStatus status) {
        return notificationRepository.findByStatusOrderByCreatedAtDesc(status);
    }
    
    // Get failed notifications for retry
    public List<Notification> getFailedNotificationsForRetry() {
        return notificationRepository.findFailedNotificationsForRetry();
    }
    
    // Retry failed notification
    @Transactional
    public void retryNotification(Long notificationId) {
        Optional<Notification> notificationOpt = notificationRepository.findById(notificationId);
        if (notificationOpt.isPresent()) {
            Notification notification = notificationOpt.get();
            if (notification.canRetry()) {
                notification.incrementRetryCount();
                notification.setStatus(Notification.NotificationStatus.PENDING);
                notificationRepository.save(notification);
                
                // Send notification again
                NotificationRequest request = convertToNotificationRequest(notification);
                sendDirectNotification(request);
            }
        }
    }
    
    // Helper methods for type conversion
    private Notification.NotificationType convertNotificationType(NotificationRequest.NotificationType type) {
        return Notification.NotificationType.valueOf(type.name());
    }
    
    private Notification.NotificationChannel convertNotificationChannel(NotificationRequest.NotificationChannel channel) {
        return Notification.NotificationChannel.valueOf(channel.name());
    }
    
    private Notification.NotificationPriority convertNotificationPriority(NotificationRequest.NotificationPriority priority) {
        return Notification.NotificationPriority.valueOf(priority.name());
    }
    
    private NotificationRequest convertToNotificationRequest(Notification notification) {
        NotificationRequest request = new NotificationRequest(
            NotificationRequest.NotificationType.valueOf(notification.getType().name()),
            NotificationRequest.NotificationChannel.valueOf(notification.getChannel().name()),
            notification.getRecipient(),
            notification.getSubject(),
            notification.getMessage()
        );
        request.setNotificationId(notification.getNotificationId());
        request.setTemplateId(notification.getTemplateId());
        request.setPriority(NotificationRequest.NotificationPriority.valueOf(notification.getPriority().name()));
        request.setScheduledAt(notification.getScheduledAt());
        return request;
    }
    
    // Get total notification count
    public long getTotalNotificationCount() {
        return notificationRepository.count();
    }
    
    // Get notification count by status
    public long getNotificationCountByStatus(Notification.NotificationStatus status) {
        return notificationRepository.countByStatus(status);
    }
    
    // Get notification count by user
    public long getNotificationCountByUser(Long userId) {
        return notificationRepository.countByUserId(userId);
    }
    
    // Get notification count by user and status
    public long getNotificationCountByUserAndStatus(Long userId, Notification.NotificationStatus status) {
        return notificationRepository.countByUserIdAndStatus(userId, status);
    }
}
