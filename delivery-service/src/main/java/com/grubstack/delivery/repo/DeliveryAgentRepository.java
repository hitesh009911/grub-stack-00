package com.grubstack.delivery.repo;

import com.grubstack.delivery.domain.DeliveryAgent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DeliveryAgentRepository extends JpaRepository<DeliveryAgent, Long> {
    
    Optional<DeliveryAgent> findByEmail(String email);
    
    List<DeliveryAgent> findByStatus(DeliveryAgent.AgentStatus status);
    
    @Query("SELECT da FROM DeliveryAgent da WHERE da.status = 'ACTIVE' ORDER BY da.lastActiveAt DESC")
    List<DeliveryAgent> findAvailableAgents();
    
    Optional<DeliveryAgent> findById(Long id);
}
