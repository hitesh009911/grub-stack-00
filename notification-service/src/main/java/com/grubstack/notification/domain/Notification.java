package com.grubstack.notification.domain;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "notifications")
public class Notification {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, unique = true)
    private String notificationId;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private NotificationType type;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private NotificationChannel channel;
    
    @Column(nullable = false)
    private String recipient;
    
    @Column(nullable = false)
    private String subject;
    
    @Column(columnDefinition = "TEXT")
    private String message;
    
    @Column(name = "template_id")
    private String templateId;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private NotificationStatus status;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private NotificationPriority priority;
    
    @Column(name = "scheduled_at")
    private Instant scheduledAt;
    
    @Column(name = "sent_at")
    private Instant sentAt;
    
    @Column(name = "delivered_at")
    private Instant deliveredAt;
    
    @Column(name = "failed_at")
    private Instant failedAt;
    
    @Column(name = "failure_reason", columnDefinition = "TEXT")
    private String failureReason;
    
    @Column(name = "retry_count")
    private Integer retryCount = 0;
    
    @Column(name = "max_retries")
    private Integer maxRetries = 3;
    
    @Column(name = "user_id")
    private Long userId;
    
    @Column(name = "order_id")
    private Long orderId;
    
    @Column(name = "delivery_id")
    private Long deliveryId;
    
    @Column(name = "metadata", columnDefinition = "JSON")
    private String metadata;
    
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;
    
    @Column(name = "updated_at")
    private Instant updatedAt;
    
    // Constructors
    public Notification() {
        this.createdAt = Instant.now();
        this.updatedAt = Instant.now();
        this.status = NotificationStatus.PENDING;
    }
    
    public Notification(String notificationId, NotificationType type, NotificationChannel channel, 
                       String recipient, String subject, String message) {
        this();
        this.notificationId = notificationId;
        this.type = type;
        this.channel = channel;
        this.recipient = recipient;
        this.subject = subject;
        this.message = message;
        this.priority = NotificationPriority.NORMAL;
    }
    
    // Enums
    public enum NotificationType {
        DELIVERY_STATUS_UPDATE,
        ORDER_CONFIRMATION,
        DELIVERY_ASSIGNED,
        DELIVERY_PICKED_UP,
        DELIVERY_IN_TRANSIT,
        DELIVERY_DELIVERED,
        DELIVERY_CANCELLED,
        ORDER_REMINDER,
        PAYMENT_CONFIRMATION,
        SYSTEM_ALERT,
        RESTAURANT_STATUS_UPDATE,
        ORDER_STATUS_UPDATE,
        WELCOME_EMAIL,
        RESTAURANT_REGISTRATION,
        RESTAURANT_APPROVAL,
        ADMIN_CREATION,
        DELIVERY_AGENT_CREATION
    }
    
    public enum NotificationChannel {
        EMAIL,
        SMS,
        PUSH_NOTIFICATION,
        IN_APP_NOTIFICATION
    }
    
    public enum NotificationStatus {
        PENDING,
        SENT,
        DELIVERED,
        FAILED,
        CANCELLED
    }
    
    public enum NotificationPriority {
        LOW,
        NORMAL,
        HIGH,
        URGENT
    }
    
    // JPA callbacks
    @PreUpdate
    public void preUpdate() {
        this.updatedAt = Instant.now();
    }
    
    // Business methods
    public void markAsSent() {
        this.status = NotificationStatus.SENT;
        this.sentAt = Instant.now();
        this.updatedAt = Instant.now();
    }
    
    public void markAsDelivered() {
        this.status = NotificationStatus.DELIVERED;
        this.deliveredAt = Instant.now();
        this.updatedAt = Instant.now();
    }
    
    public void markAsFailed(String reason) {
        this.status = NotificationStatus.FAILED;
        this.failedAt = Instant.now();
        this.failureReason = reason;
        this.updatedAt = Instant.now();
    }
    
    public void incrementRetryCount() {
        this.retryCount++;
        this.updatedAt = Instant.now();
    }
    
    public boolean canRetry() {
        return this.retryCount < this.maxRetries && this.status == NotificationStatus.FAILED;
    }
    
    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getNotificationId() { return notificationId; }
    public void setNotificationId(String notificationId) { this.notificationId = notificationId; }
    
    public NotificationType getType() { return type; }
    public void setType(NotificationType type) { this.type = type; }
    
    public NotificationChannel getChannel() { return channel; }
    public void setChannel(NotificationChannel channel) { this.channel = channel; }
    
    public String getRecipient() { return recipient; }
    public void setRecipient(String recipient) { this.recipient = recipient; }
    
    public String getSubject() { return subject; }
    public void setSubject(String subject) { this.subject = subject; }
    
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    
    public String getTemplateId() { return templateId; }
    public void setTemplateId(String templateId) { this.templateId = templateId; }
    
    public NotificationStatus getStatus() { return status; }
    public void setStatus(NotificationStatus status) { this.status = status; }
    
    public NotificationPriority getPriority() { return priority; }
    public void setPriority(NotificationPriority priority) { this.priority = priority; }
    
    public Instant getScheduledAt() { return scheduledAt; }
    public void setScheduledAt(Instant scheduledAt) { this.scheduledAt = scheduledAt; }
    
    public Instant getSentAt() { return sentAt; }
    public void setSentAt(Instant sentAt) { this.sentAt = sentAt; }
    
    public Instant getDeliveredAt() { return deliveredAt; }
    public void setDeliveredAt(Instant deliveredAt) { this.deliveredAt = deliveredAt; }
    
    public Instant getFailedAt() { return failedAt; }
    public void setFailedAt(Instant failedAt) { this.failedAt = failedAt; }
    
    public String getFailureReason() { return failureReason; }
    public void setFailureReason(String failureReason) { this.failureReason = failureReason; }
    
    public Integer getRetryCount() { return retryCount; }
    public void setRetryCount(Integer retryCount) { this.retryCount = retryCount; }
    
    public Integer getMaxRetries() { return maxRetries; }
    public void setMaxRetries(Integer maxRetries) { this.maxRetries = maxRetries; }
    
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    
    public Long getOrderId() { return orderId; }
    public void setOrderId(Long orderId) { this.orderId = orderId; }
    
    public Long getDeliveryId() { return deliveryId; }
    public void setDeliveryId(Long deliveryId) { this.deliveryId = deliveryId; }
    
    public String getMetadata() { return metadata; }
    public void setMetadata(String metadata) { this.metadata = metadata; }
    
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
    
    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
    
    @Override
    public String toString() {
        return "Notification{" +
                "id=" + id +
                ", notificationId='" + notificationId + '\'' +
                ", type=" + type +
                ", channel=" + channel +
                ", recipient='" + recipient + '\'' +
                ", status=" + status +
                ", priority=" + priority +
                '}';
    }
}
