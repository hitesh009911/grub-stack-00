package com.grubstack.notification.repository;

import com.grubstack.notification.domain.Notification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    
    // Find by notification ID
    Optional<Notification> findByNotificationId(String notificationId);
    
    // Find by user ID
    List<Notification> findByUserIdOrderByCreatedAtDesc(Long userId);
    Page<Notification> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);
    
    // Find by order ID
    List<Notification> findByOrderIdOrderByCreatedAtDesc(Long orderId);
    
    // Find by delivery ID
    List<Notification> findByDeliveryIdOrderByCreatedAtDesc(Long deliveryId);
    
    // Find by status
    List<Notification> findByStatusOrderByCreatedAtDesc(Notification.NotificationStatus status);
    Page<Notification> findByStatusOrderByCreatedAtDesc(Notification.NotificationStatus status, Pageable pageable);
    
    // Find by channel
    List<Notification> findByChannelOrderByCreatedAtDesc(Notification.NotificationChannel channel);
    
    // Find by type
    List<Notification> findByTypeOrderByCreatedAtDesc(Notification.NotificationType type);
    
    // Find by priority
    List<Notification> findByPriorityOrderByCreatedAtDesc(Notification.NotificationPriority priority);
    
    // Find failed notifications that can be retried
    @Query("SELECT n FROM Notification n WHERE n.status = 'FAILED' AND n.retryCount < n.maxRetries ORDER BY n.createdAt ASC")
    List<Notification> findFailedNotificationsForRetry();
    
    // Find pending notifications
    @Query("SELECT n FROM Notification n WHERE n.status = 'PENDING' AND n.scheduledAt <= :now ORDER BY n.priority DESC, n.createdAt ASC")
    List<Notification> findPendingNotifications(@Param("now") Instant now);
    
    // Find notifications by user and status
    List<Notification> findByUserIdAndStatusOrderByCreatedAtDesc(Long userId, Notification.NotificationStatus status);
    
    // Find notifications by user and type
    List<Notification> findByUserIdAndTypeOrderByCreatedAtDesc(Long userId, Notification.NotificationType type);
    
    // Find notifications by date range
    @Query("SELECT n FROM Notification n WHERE n.createdAt BETWEEN :startDate AND :endDate ORDER BY n.createdAt DESC")
    List<Notification> findByCreatedAtBetween(@Param("startDate") Instant startDate, @Param("endDate") Instant endDate);
    
    // Count notifications by status
    long countByStatus(Notification.NotificationStatus status);
    
    // Count notifications by user
    long countByUserId(Long userId);
    
    // Count notifications by user and status
    long countByUserIdAndStatus(Long userId, Notification.NotificationStatus status);
    
    // Find notifications for retry (failed with retry count < max retries)
    @Query("SELECT n FROM Notification n WHERE n.status = 'FAILED' AND n.retryCount < n.maxRetries AND n.updatedAt < :retryAfter ORDER BY n.updatedAt ASC")
    List<Notification> findNotificationsForRetry(@Param("retryAfter") Instant retryAfter);
    
    // Find notifications by recipient
    List<Notification> findByRecipientOrderByCreatedAtDesc(String recipient);
    
    // Find notifications by recipient and status
    List<Notification> findByRecipientAndStatusOrderByCreatedAtDesc(String recipient, Notification.NotificationStatus status);
    
    // Delete old notifications (for cleanup)
    @Query("DELETE FROM Notification n WHERE n.createdAt < :cutoffDate AND n.status IN ('DELIVERED', 'FAILED')")
    int deleteOldNotifications(@Param("cutoffDate") Instant cutoffDate);
}
