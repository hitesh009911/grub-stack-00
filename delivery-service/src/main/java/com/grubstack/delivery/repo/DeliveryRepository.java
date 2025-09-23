package com.grubstack.delivery.repo;

import com.grubstack.delivery.domain.Delivery;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DeliveryRepository extends JpaRepository<Delivery, Long> {
    
    Optional<Delivery> findByOrderId(Long orderId);
    
    List<Delivery> findByCustomerId(Long customerId);
    
    List<Delivery> findByStatus(Delivery.DeliveryStatus status);
    
    @Query("SELECT d FROM Delivery d WHERE d.agent.id = :agentId AND d.status IN ('ASSIGNED', 'PICKED_UP', 'IN_TRANSIT')")
    List<Delivery> findActiveDeliveriesByAgent(Long agentId);
    
    List<Delivery> findByAgentId(Long agentId);
    
    @Query("SELECT d FROM Delivery d WHERE d.status = 'PENDING' ORDER BY d.createdAt ASC")
    List<Delivery> findPendingDeliveries();
}
