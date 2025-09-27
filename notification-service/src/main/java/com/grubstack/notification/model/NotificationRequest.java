package com.grubstack.notification.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.time.Instant;
import java.util.Map;

public class NotificationRequest {
    
    @JsonProperty("notificationId")
    private String notificationId;
    
    @JsonProperty("type")
    private NotificationType type;
    
    @JsonProperty("channel")
    private NotificationChannel channel;
    
    @JsonProperty("recipient")
    private String recipient; // email or phone number
    
    @JsonProperty("subject")
    private String subject;
    
    @JsonProperty("message")
    private String message;
    
    @JsonProperty("templateId")
    private String templateId;
    
    @JsonProperty("templateData")
    private Map<String, Object> templateData;
    
    @JsonProperty("priority")
    private NotificationPriority priority;
    
    @JsonProperty("scheduledAt")
    private Instant scheduledAt;
    
    @JsonProperty("metadata")
    private Map<String, Object> metadata;
    
    // Constructors
    public NotificationRequest() {}
    
    public NotificationRequest(NotificationType type, NotificationChannel channel, 
                              String recipient, String subject, String message) {
        this.type = type;
        this.channel = channel;
        this.recipient = recipient;
        this.subject = subject;
        this.message = message;
        this.priority = NotificationPriority.NORMAL;
        this.scheduledAt = Instant.now();
    }
    
    // Getters and Setters
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
    
    public Map<String, Object> getTemplateData() { return templateData; }
    public void setTemplateData(Map<String, Object> templateData) { this.templateData = templateData; }
    
    public NotificationPriority getPriority() { return priority; }
    public void setPriority(NotificationPriority priority) { this.priority = priority; }
    
    public Instant getScheduledAt() { return scheduledAt; }
    public void setScheduledAt(Instant scheduledAt) { this.scheduledAt = scheduledAt; }
    
    public Map<String, Object> getMetadata() { return metadata; }
    public void setMetadata(Map<String, Object> metadata) { this.metadata = metadata; }
    
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
        WELCOME_EMAIL,
        RESTAURANT_REGISTRATION,
        RESTAURANT_APPROVAL,
        ADMIN_CREATION,
        DELIVERY_AGENT_CREATION,
        DELIVERY_AGENT_REGISTRATION,
        DELIVERY_AGENT_APPROVED,
        DELIVERY_AGENT_REJECTED,
        DELIVERY_AGENT_DELETED,
        ADMIN_WELCOME,
        ADMIN_ACCOUNT_DEACTIVATED,
        ADMIN_ACCOUNT_REACTIVATED,
        ADMIN_ACCOUNT_DELETED,
        ADMIN_PROFILE_UPDATED,
        RESTAURANT_REGISTRATION_ACKNOWLEDGMENT,
        RESTAURANT_APPROVED,
        RESTAURANT_DELETED
    }
    
    public enum NotificationChannel {
        EMAIL,
        SMS,
        PUSH_NOTIFICATION,
        IN_APP_NOTIFICATION
    }
    
    public enum NotificationPriority {
        LOW,
        NORMAL,
        HIGH,
        URGENT
    }
    
    @Override
    public String toString() {
        return "NotificationRequest{" +
                "notificationId='" + notificationId + '\'' +
                ", type=" + type +
                ", channel=" + channel +
                ", recipient='" + recipient + '\'' +
                ", subject='" + subject + '\'' +
                ", priority=" + priority +
                '}';
    }
}
