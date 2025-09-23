package com.grubstack.notification.service;

import com.grubstack.notification.model.DeliveryEvent;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.support.KafkaHeaders;
import org.springframework.messaging.handler.annotation.Header;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Service;

@Service
public class DeliveryEventConsumer {
    
    private static final Logger logger = LoggerFactory.getLogger(DeliveryEventConsumer.class);
    
    @Autowired
    private NotificationService notificationService;
    
    @KafkaListener(topics = "delivery-events", groupId = "notification-service-group")
    public void consumeDeliveryEvent(
            @Payload DeliveryEvent event,
            @Header(KafkaHeaders.RECEIVED_TOPIC) String topic,
            @Header(KafkaHeaders.RECEIVED_PARTITION) int partition,
            @Header(KafkaHeaders.OFFSET) long offset) {
        
        logger.info("Received delivery event from topic: {}, partition: {}, offset: {}, event: {}", 
                   topic, partition, offset, event);
        
        try {
            // Process the delivery event and generate notifications
            notificationService.processDeliveryEvent(event);
            
            logger.info("Successfully processed delivery event: {}", event.getEventType());
        } catch (Exception e) {
            logger.error("Error processing delivery event: {}", event, e);
            // TODO: Implement dead letter queue or retry mechanism
        }
    }
    
    @KafkaListener(topics = "delivery-status-updates", groupId = "notification-service-group")
    public void consumeDeliveryStatusUpdate(
            @Payload DeliveryEvent event,
            @Header(KafkaHeaders.RECEIVED_TOPIC) String topic,
            @Header(KafkaHeaders.RECEIVED_PARTITION) int partition,
            @Header(KafkaHeaders.OFFSET) long offset) {
        
        logger.info("Received delivery status update from topic: {}, partition: {}, offset: {}, event: {}", 
                   topic, partition, offset, event);
        
        try {
            // Process the delivery status update
            notificationService.processDeliveryEvent(event);
            
            logger.info("Successfully processed delivery status update: {}", event.getEventType());
        } catch (Exception e) {
            logger.error("Error processing delivery status update: {}", event, e);
        }
    }
}
