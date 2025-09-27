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
    
    // Welcome email method (similar to sendOrderConfirmation)
    public void sendWelcomeEmail(String userEmail, String userName) {
        Map<String, Object> templateData = new HashMap<>();
        templateData.put("userName", userName);
        templateData.put("userEmail", userEmail);
        templateData.put("registrationDate", java.time.LocalDateTime.now().toString());
        
        NotificationRequest notification = new NotificationRequest(
            NotificationRequest.NotificationType.WELCOME_EMAIL,
            NotificationRequest.NotificationChannel.EMAIL,
            userEmail,
            "Welcome to GrubStack! 🎉",
            "Welcome to GrubStack! We're excited to have you on board. Start exploring amazing restaurants and place your first order!"
        );
        
        notification.setNotificationId("welcome-" + UUID.randomUUID().toString());
        notification.setTemplateId("welcome-email");
        notification.setTemplateData(templateData);
        notification.setPriority(NotificationRequest.NotificationPriority.NORMAL);
        
        sendEmailNotification(notification);
    }
    
    // Admin creation notification method
    public void sendAdminCreationNotification(String adminEmail, String adminName, String password, String role) {
        logger.info("Sending admin creation notification to: {}", adminEmail);
        
        try {
            Map<String, Object> templateData = new HashMap<>();
            templateData.put("adminName", adminName);
            templateData.put("adminEmail", adminEmail);
            templateData.put("password", password);
            templateData.put("role", role);
            templateData.put("creationDate", java.time.LocalDateTime.now().toString());
            
            NotificationRequest notification = new NotificationRequest(
                NotificationRequest.NotificationType.ADMIN_CREATION,
                NotificationRequest.NotificationChannel.EMAIL,
                adminEmail,
                "Welcome to GrubStack Admin Panel! 👑",
                "Your admin account has been created successfully. You now have access to the GrubStack admin panel with " + role + " privileges."
            );
            
            notification.setNotificationId("admin-creation-" + UUID.randomUUID().toString());
            notification.setTemplateId("admin-creation");
            notification.setTemplateData(templateData);
            notification.setPriority(NotificationRequest.NotificationPriority.HIGH);
            
            sendEmailNotification(notification);
            logger.info("Admin creation notification sent to: {}", adminEmail);
        } catch (Exception e) {
            logger.error("Failed to send admin creation notification to: {}", adminEmail, e);
        }
    }
    
    // Delivery agent registration acknowledgment method
    public void sendDeliveryAgentRegistrationAcknowledgment(String agentEmail, String agentName, String phone, String vehicleType) {
        logger.info("Sending delivery agent registration acknowledgment to: {}", agentEmail);
        
        try {
            Map<String, Object> templateData = new HashMap<>();
            templateData.put("agentName", agentName);
            templateData.put("agentEmail", agentEmail);
            templateData.put("phone", phone);
            templateData.put("vehicleType", vehicleType);
            templateData.put("registrationDate", java.time.LocalDateTime.now().toString());
            
            NotificationRequest notification = new NotificationRequest(
                NotificationRequest.NotificationType.DELIVERY_AGENT_REGISTRATION,
                NotificationRequest.NotificationChannel.EMAIL,
                agentEmail,
                "Application Received - GrubStack Delivery 🚚",
                "Thank you for your interest in joining the GrubStack delivery team! We have successfully received your application and it is now under review."
            );
            
            notification.setNotificationId("delivery-agent-registration-" + UUID.randomUUID().toString());
            notification.setTemplateId("delivery-agent-registration");
            notification.setTemplateData(templateData);
            notification.setPriority(NotificationRequest.NotificationPriority.NORMAL);
            
            sendEmailNotification(notification);
            logger.info("Delivery agent registration acknowledgment sent to: {}", agentEmail);
        } catch (Exception e) {
            logger.error("Failed to send delivery agent registration acknowledgment to: {}", agentEmail, e);
        }
    }
    
    // Delivery agent approval notification method
    public void sendDeliveryAgentApprovalNotification(String agentEmail, String agentName, String loginPassword) {
        logger.info("Sending delivery agent approval notification to: {}", agentEmail);
        
        try {
            Map<String, Object> templateData = new HashMap<>();
            templateData.put("agentName", agentName);
            templateData.put("agentEmail", agentEmail);
            templateData.put("loginPassword", loginPassword);
            templateData.put("loginUrl", "http://localhost:5173/delivery/login");
            templateData.put("approvalDate", java.time.LocalDateTime.now().toString());
            
            NotificationRequest notification = new NotificationRequest(
                NotificationRequest.NotificationType.DELIVERY_AGENT_APPROVED,
                NotificationRequest.NotificationChannel.EMAIL,
                agentEmail,
                "Application Approved - Welcome to GrubStack! 🎉",
                "Congratulations! Your application to become a delivery agent with GrubStack has been approved! You can now start delivering orders and earning money."
            );
            
            notification.setNotificationId("delivery-agent-approved-" + UUID.randomUUID().toString());
            notification.setTemplateId("delivery-agent-approved");
            notification.setTemplateData(templateData);
            notification.setPriority(NotificationRequest.NotificationPriority.HIGH);
            
            sendEmailNotification(notification);
            logger.info("Delivery agent approval notification sent to: {}", agentEmail);
        } catch (Exception e) {
            logger.error("Failed to send delivery agent approval notification to: {}", agentEmail, e);
        }
    }
    
    // Delivery agent rejection notification method
    public void sendDeliveryAgentRejectionNotification(String agentEmail, String agentName, String reason) {
        logger.info("Sending delivery agent rejection notification to: {}", agentEmail);
        
        try {
            Map<String, Object> templateData = new HashMap<>();
            templateData.put("agentName", agentName);
            templateData.put("agentEmail", agentEmail);
            templateData.put("reason", reason);
            templateData.put("rejectionDate", java.time.LocalDateTime.now().toString());
            
            NotificationRequest notification = new NotificationRequest(
                NotificationRequest.NotificationType.DELIVERY_AGENT_REJECTED,
                NotificationRequest.NotificationChannel.EMAIL,
                agentEmail,
                "Application Update - GrubStack Delivery",
                "Thank you for your interest in joining the GrubStack delivery team. Unfortunately, we cannot approve your application at this time."
            );
            
            notification.setNotificationId("delivery-agent-rejected-" + UUID.randomUUID().toString());
            notification.setTemplateId("delivery-agent-rejected");
            notification.setTemplateData(templateData);
            notification.setPriority(NotificationRequest.NotificationPriority.NORMAL);
            
            sendEmailNotification(notification);
            logger.info("Delivery agent rejection notification sent to: {}", agentEmail);
        } catch (Exception e) {
            logger.error("Failed to send delivery agent rejection notification to: {}", agentEmail, e);
        }
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
    
    private void sendEmailNotification(NotificationRequest notification) {
        try {
            // Send to email-notifications topic (working approach)
            kafkaTemplate.send("email-notifications", notification.getNotificationId(), notification);
            logger.info("Email notification sent to Kafka: {}", notification);
        } catch (Exception e) {
            logger.error("Error sending email notification to Kafka: {}", notification, e);
        }
    }
    
    // Direct notification sending (for immediate processing)
    public void sendDirectNotification(NotificationRequest notification) {
        logger.info("=== SEND DIRECT NOTIFICATION DEBUG ===");
        logger.info("Notification ID: {}", notification.getNotificationId());
        logger.info("Type: {}", notification.getType());
        logger.info("Channel: {}", notification.getChannel());
        logger.info("Recipient: {}", notification.getRecipient());
        
        try {
            // Process notification directly (same as processNotificationDirectly)
            processNotificationDirectly(notification);
            logger.info("Notification processed directly: {}", notification.getNotificationId());
        } catch (Exception e) {
            logger.error("Error in sendDirectNotification: {}", notification, e);
        }
    }
    
    // Process notification directly (called by Kafka consumer)
    public void processNotificationDirectly(NotificationRequest notification) {
        logger.info("=== PROCESS NOTIFICATION DIRECTLY ===");
        logger.info("Notification ID: {}", notification.getNotificationId());
        logger.info("Type: {}", notification.getType());
        logger.info("Channel: {}", notification.getChannel());
        logger.info("Recipient: {}", notification.getRecipient());
        
        try {
            // Save notification to database
            Notification notificationEntity = saveNotificationToDatabaseInternal(notification);
            logger.info("Notification saved to database with ID: {}", notificationEntity.getId());
            
            // Send notification based on channel
            boolean sent = false;
            String errorMessage = null;
            
            try {
                switch (notification.getChannel()) {
                    case EMAIL:
                        logger.info("Sending email to: {}", notification.getRecipient());
                        emailService.sendEmail(notification);
                        sent = true;
                        logger.info("Email sent successfully to: {}", notification.getRecipient());
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
            logger.error("Error processing notification directly: {}", notification, e);
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
        
        Notification saved = notificationRepository.save(notification);
        logger.info("Notification saved to database with ID: {} and notificationId: {}", saved.getId(), saved.getNotificationId());
        return saved;
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
    
    // Send order cancelled notification
    public void sendOrderCancelledNotification(Long orderId, Long userId, String customerEmail, String restaurantName) {
        logger.info("Sending order cancelled notification for order: {}", orderId);
        
        try {
            Map<String, Object> templateData = new HashMap<>();
            templateData.put("orderId", orderId);
            templateData.put("customerName", "Customer");
            templateData.put("restaurantName", restaurantName);
            templateData.put("cancellationTime", java.time.LocalDateTime.now().toString());

            NotificationRequest notification = new NotificationRequest();
            notification.setType(NotificationRequest.NotificationType.DELIVERY_CANCELLED);
            notification.setChannel(NotificationRequest.NotificationChannel.EMAIL);
            notification.setRecipient(customerEmail);
            notification.setSubject("Order Cancelled - Order #" + orderId);
            notification.setMessage("Your order #" + orderId + " has been cancelled. If you have any questions, please contact " + restaurantName + ".");
            notification.setNotificationId("order-cancelled-" + orderId + "-" + UUID.randomUUID().toString());
            notification.setTemplateId("order-cancelled");
            notification.setTemplateData(templateData);
            notification.setPriority(NotificationRequest.NotificationPriority.NORMAL);

            sendDirectNotification(notification);
            logger.info("Order cancelled notification sent for order: {}", orderId);
        } catch (Exception e) {
            logger.error("Failed to send order cancelled notification for order: {}", orderId, e);
        }
    }
    
    // Delivery agent deletion notification
    public void sendDeliveryAgentDeletionNotification(String agentEmail, String agentName, String reason) {
        Map<String, Object> templateData = new HashMap<>();
        templateData.put("agentName", agentName);
        templateData.put("agentEmail", agentEmail);
        templateData.put("reason", reason);
        
        NotificationRequest notification = new NotificationRequest(
            NotificationRequest.NotificationType.DELIVERY_AGENT_DELETED,
            NotificationRequest.NotificationChannel.EMAIL,
            agentEmail,
            "Account Deleted - GrubStack Delivery",
            "Your delivery agent account has been permanently deleted from our system."
        );
        
        notification.setNotificationId("agent-deletion-" + UUID.randomUUID().toString());
        notification.setTemplateId("delivery-agent-deleted");
        notification.setTemplateData(templateData);
        notification.setPriority(NotificationRequest.NotificationPriority.HIGH);
        
        sendNotification(notification);
    }
    
    // Admin welcome notification
    public void sendAdminWelcomeNotification(String adminEmail, String adminName, String temporaryPassword) {
        Map<String, Object> templateData = new HashMap<>();
        templateData.put("adminName", adminName);
        templateData.put("adminEmail", adminEmail);
        templateData.put("temporaryPassword", temporaryPassword);
        
        NotificationRequest notification = new NotificationRequest(
            NotificationRequest.NotificationType.ADMIN_WELCOME,
            NotificationRequest.NotificationChannel.EMAIL,
            adminEmail,
            "Welcome to GrubStack Admin Panel",
            "Your admin account has been created successfully."
        );
        
        notification.setNotificationId("admin-welcome-" + UUID.randomUUID().toString());
        notification.setTemplateId("admin-welcome");
        notification.setTemplateData(templateData);
        notification.setPriority(NotificationRequest.NotificationPriority.HIGH);
        
        sendNotification(notification);
    }
    
    // Admin account deactivated notification
    public void sendAdminAccountDeactivatedNotification(String adminEmail, String adminName, String reason) {
        Map<String, Object> templateData = new HashMap<>();
        templateData.put("adminName", adminName);
        templateData.put("adminEmail", adminEmail);
        templateData.put("reason", reason);
        
        NotificationRequest notification = new NotificationRequest(
            NotificationRequest.NotificationType.ADMIN_ACCOUNT_DEACTIVATED,
            NotificationRequest.NotificationChannel.EMAIL,
            adminEmail,
            "Account Deactivated - GrubStack Admin",
            "Your admin account has been deactivated."
        );
        
        notification.setNotificationId("admin-deactivated-" + UUID.randomUUID().toString());
        notification.setTemplateId("admin-account-deactivated");
        notification.setTemplateData(templateData);
        notification.setPriority(NotificationRequest.NotificationPriority.HIGH);
        
        sendNotification(notification);
    }
    
    // Admin account reactivated notification
    public void sendAdminAccountReactivatedNotification(String adminEmail, String adminName) {
        Map<String, Object> templateData = new HashMap<>();
        templateData.put("adminName", adminName);
        templateData.put("adminEmail", adminEmail);
        
        NotificationRequest notification = new NotificationRequest(
            NotificationRequest.NotificationType.ADMIN_ACCOUNT_REACTIVATED,
            NotificationRequest.NotificationChannel.EMAIL,
            adminEmail,
            "Account Reactivated - GrubStack Admin",
            "Your admin account has been reactivated."
        );
        
        notification.setNotificationId("admin-reactivated-" + UUID.randomUUID().toString());
        notification.setTemplateId("admin-account-reactivated");
        notification.setTemplateData(templateData);
        notification.setPriority(NotificationRequest.NotificationPriority.HIGH);
        
        sendNotification(notification);
    }
    
    // Admin account deleted notification
    public void sendAdminAccountDeletedNotification(String adminEmail, String adminName, String reason) {
        Map<String, Object> templateData = new HashMap<>();
        templateData.put("adminName", adminName);
        templateData.put("adminEmail", adminEmail);
        templateData.put("reason", reason);
        
        NotificationRequest notification = new NotificationRequest(
            NotificationRequest.NotificationType.ADMIN_ACCOUNT_DELETED,
            NotificationRequest.NotificationChannel.EMAIL,
            adminEmail,
            "Account Deleted - GrubStack Admin",
            "Your admin account has been permanently deleted."
        );
        
        notification.setNotificationId("admin-deleted-" + UUID.randomUUID().toString());
        notification.setTemplateId("admin-account-deleted");
        notification.setTemplateData(templateData);
        notification.setPriority(NotificationRequest.NotificationPriority.HIGH);
        
        sendNotification(notification);
    }
    
    // Admin profile updated notification
    public void sendAdminProfileUpdatedNotification(String adminEmail, String adminName, Map<String, Object> changes) {
        Map<String, Object> templateData = new HashMap<>();
        templateData.put("adminName", adminName);
        templateData.put("adminEmail", adminEmail);
        templateData.put("changes", changes);
        
        NotificationRequest notification = new NotificationRequest(
            NotificationRequest.NotificationType.ADMIN_PROFILE_UPDATED,
            NotificationRequest.NotificationChannel.EMAIL,
            adminEmail,
            "Profile Updated - GrubStack Admin",
            "Your admin profile has been updated successfully."
        );
        
        notification.setNotificationId("admin-profile-updated-" + UUID.randomUUID().toString());
        notification.setTemplateId("admin-profile-updated");
        notification.setTemplateData(templateData);
        notification.setPriority(NotificationRequest.NotificationPriority.NORMAL);
        
        sendNotification(notification);
    }
    
    // Restaurant registration acknowledgment notification
    public void sendRestaurantRegistrationAcknowledgment(String email, String restaurantName, String ownerName, String phone, String address) {
        Map<String, Object> templateData = new HashMap<>();
        templateData.put("email", email);
        templateData.put("restaurantName", restaurantName);
        templateData.put("ownerName", ownerName);
        templateData.put("phone", phone);
        templateData.put("address", address);
        
        NotificationRequest notification = new NotificationRequest(
            NotificationRequest.NotificationType.RESTAURANT_REGISTRATION_ACKNOWLEDGMENT,
            NotificationRequest.NotificationChannel.EMAIL,
            email,
            "Registration Received - GrubStack Restaurant",
            "Thank you for registering your restaurant with GrubStack."
        );
        
        notification.setNotificationId("restaurant-registration-ack-" + UUID.randomUUID().toString());
        notification.setTemplateId("restaurant-registration-acknowledgment");
        notification.setTemplateData(templateData);
        notification.setPriority(NotificationRequest.NotificationPriority.NORMAL);
        
        sendNotification(notification);
    }
    
    // Restaurant approved notification
    public void sendRestaurantApprovedNotification(String email, String restaurantName, String ownerName, String password) {
        Map<String, Object> templateData = new HashMap<>();
        templateData.put("email", email);
        templateData.put("restaurantName", restaurantName);
        templateData.put("ownerName", ownerName);
        templateData.put("password", password);
        
        NotificationRequest notification = new NotificationRequest(
            NotificationRequest.NotificationType.RESTAURANT_APPROVED,
            NotificationRequest.NotificationChannel.EMAIL,
            email,
            "Restaurant Approved - GrubStack",
            "Congratulations! Your restaurant has been approved and is now live."
        );
        
        notification.setNotificationId("restaurant-approved-" + UUID.randomUUID().toString());
        notification.setTemplateId("restaurant-approved");
        notification.setTemplateData(templateData);
        notification.setPriority(NotificationRequest.NotificationPriority.HIGH);
        
        sendNotification(notification);
    }
    
    // Restaurant deleted notification
    public void sendRestaurantDeletedNotification(String email, String restaurantName, String ownerName, String reason) {
        Map<String, Object> templateData = new HashMap<>();
        templateData.put("email", email);
        templateData.put("restaurantName", restaurantName);
        templateData.put("ownerName", ownerName);
        templateData.put("reason", reason);
        
        NotificationRequest notification = new NotificationRequest(
            NotificationRequest.NotificationType.RESTAURANT_DELETED,
            NotificationRequest.NotificationChannel.EMAIL,
            email,
            "Restaurant Deleted - GrubStack",
            "Your restaurant account has been deleted from GrubStack."
        );
        
        notification.setNotificationId("restaurant-deleted-" + UUID.randomUUID().toString());
        notification.setTemplateId("restaurant-deleted");
        notification.setTemplateData(templateData);
        notification.setPriority(NotificationRequest.NotificationPriority.HIGH);
        
        sendNotification(notification);
    }
}
