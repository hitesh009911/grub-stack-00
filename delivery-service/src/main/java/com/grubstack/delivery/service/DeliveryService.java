package com.grubstack.delivery.service;

import com.grubstack.delivery.domain.Delivery;
import com.grubstack.delivery.domain.DeliveryAgent;
import com.grubstack.delivery.repo.DeliveryRepository;
import com.grubstack.delivery.repo.DeliveryAgentRepository;
import com.grubstack.delivery.event.DeliveryEventPublisher;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

@Service
public class DeliveryService {
    
    private final DeliveryRepository deliveryRepo;
    private final DeliveryAgentRepository agentRepo;
    
    @Autowired
    private DeliveryEventPublisher eventPublisher;
    
    public DeliveryService(DeliveryRepository deliveryRepo, DeliveryAgentRepository agentRepo) {
        this.deliveryRepo = deliveryRepo;
        this.agentRepo = agentRepo;
    }
    
    // Delivery Management
    @Transactional
    public Delivery createDelivery(Long orderId, Long restaurantId, Long customerId, 
                                 String pickupAddress, String deliveryAddress) {
        Delivery delivery = new Delivery(orderId, restaurantId, customerId, pickupAddress, deliveryAddress);
        delivery.setEstimatedDeliveryTime(calculateEstimatedTime(pickupAddress, deliveryAddress));
        
        Delivery savedDelivery = deliveryRepo.save(delivery);
        
        // Publish delivery created event
        eventPublisher.publishDeliveryCreated(
            savedDelivery.getId(),
            savedDelivery.getOrderId(),
            savedDelivery.getRestaurantId(),
            savedDelivery.getCustomerId(),
            savedDelivery.getPickupAddress(),
            savedDelivery.getDeliveryAddress(),
            savedDelivery.getEstimatedDeliveryTime()
        );
        
        return savedDelivery;
    }
    
    @Transactional
    public Delivery assignDelivery(Long deliveryId, Long agentId) {
        Delivery delivery = deliveryRepo.findById(deliveryId)
                .orElseThrow(() -> new IllegalArgumentException("Delivery not found"));
        
        DeliveryAgent agent = agentRepo.findById(agentId)
                .orElseThrow(() -> new IllegalArgumentException("Agent not found"));
        
        if (agent.getStatus() == DeliveryAgent.AgentStatus.INACTIVE) {
            throw new IllegalArgumentException("Agent is inactive and cannot be assigned deliveries");
        }
        
        // If delivery already has an agent, make the old agent available
        if (delivery.getAgent() != null) {
            DeliveryAgent oldAgent = delivery.getAgent();
            oldAgent.setStatus(DeliveryAgent.AgentStatus.ACTIVE);
            oldAgent.setLastActiveAt(Instant.now());
            agentRepo.save(oldAgent);
        }
        
        delivery.setAgent(agent);
        delivery.setStatus(Delivery.DeliveryStatus.ASSIGNED);
        delivery.setAssignedAt(Instant.now());
        
        // Agent remains ACTIVE and can handle multiple deliveries
        agent.setLastActiveAt(Instant.now());
        
        deliveryRepo.save(delivery);
        agentRepo.save(agent);
        
        // Publish delivery assigned event
        eventPublisher.publishDeliveryAssigned(
            delivery.getId(),
            delivery.getOrderId(),
            delivery.getCustomerId(),
            agent.getId(),
            agent.getName(),
            agent.getPhone(),
            delivery.getStatus().name()
        );
        
        return delivery;
    }
    
    @Transactional
    public Delivery updateDeliveryStatus(Long deliveryId, Delivery.DeliveryStatus status) {
        Delivery delivery = deliveryRepo.findById(deliveryId)
                .orElseThrow(() -> new IllegalArgumentException("Delivery not found"));
        
        delivery.setStatus(status);
        
        switch (status) {
            case PICKED_UP:
                delivery.setPickedUpAt(Instant.now());
                break;
            case DELIVERED:
                delivery.setDeliveredAt(Instant.now());
                // Mark agent as available
                if (delivery.getAgent() != null) {
                    delivery.getAgent().setStatus(DeliveryAgent.AgentStatus.ACTIVE);
                    delivery.getAgent().setLastActiveAt(Instant.now());
                    agentRepo.save(delivery.getAgent());
                }
                break;
        }
        
        Delivery savedDelivery = deliveryRepo.save(delivery);
        
        // Publish delivery status update event
        String agentName = savedDelivery.getAgent() != null ? savedDelivery.getAgent().getName() : null;
        String agentPhone = savedDelivery.getAgent() != null ? savedDelivery.getAgent().getPhone() : null;
        
        eventPublisher.publishDeliveryStatusUpdate(
            savedDelivery.getId(),
            savedDelivery.getOrderId(),
            savedDelivery.getCustomerId(),
            savedDelivery.getStatus().name(),
            agentName,
            agentPhone,
            savedDelivery.getEstimatedDeliveryTime()
        );
        
        // Publish completion event if delivered
        if (savedDelivery.getStatus() == Delivery.DeliveryStatus.DELIVERED && agentName != null) {
            eventPublisher.publishDeliveryCompleted(
                savedDelivery.getId(),
                savedDelivery.getOrderId(),
                savedDelivery.getCustomerId(),
                agentName
            );
        }
        
        return savedDelivery;
    }
    
    public List<Delivery> getPendingDeliveries() {
        return deliveryRepo.findPendingDeliveries();
    }
    
    public List<Delivery> getAllDeliveries() {
        return deliveryRepo.findAll();
    }
    
    public List<Delivery> getDeliveriesByCustomer(Long customerId) {
        return deliveryRepo.findByCustomerId(customerId);
    }
    
    public List<Delivery> getActiveDeliveriesByAgent(Long agentId) {
        return deliveryRepo.findActiveDeliveriesByAgent(agentId);
    }
    
    public List<Delivery> getAllDeliveriesByAgent(Long agentId) {
        return deliveryRepo.findByAgentId(agentId);
    }
    
    public Optional<Delivery> getDeliveryByOrderId(Long orderId) {
        return deliveryRepo.findByOrderId(orderId);
    }
    
    // Agent Management
    @Transactional
    public DeliveryAgent createAgent(String name, String email, String phone, 
                                   String vehicleType, String licenseNumber, String password) {
        if (agentRepo.findByEmail(email).isPresent()) {
            throw new IllegalArgumentException("Agent with this email already exists");
        }
        
        // Hash the password
        BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
        String passwordHash = passwordEncoder.encode(password);
        
        DeliveryAgent agent = new DeliveryAgent(name, email, phone, vehicleType, licenseNumber, passwordHash);
        agent.setStatus(DeliveryAgent.AgentStatus.PENDING_APPROVAL);
        return agentRepo.save(agent);
    }
    
    // Agent Management (Admin creates agent without password - agent sets password on first login)
    @Transactional
    public DeliveryAgent createAgentByAdmin(String name, String email, String phone, 
                                          String vehicleType, String licenseNumber) {
        if (agentRepo.findByEmail(email).isPresent()) {
            throw new IllegalArgumentException("Agent with this email already exists");
        }
        
        // Create agent with default password that agent must change on first login
        BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
        String defaultPassword = "delivery123"; // Default password
        String passwordHash = passwordEncoder.encode(defaultPassword);
        
        DeliveryAgent agent = new DeliveryAgent(name, email, phone, vehicleType, licenseNumber, passwordHash);
        return agentRepo.save(agent);
    }
    
    public List<DeliveryAgent> getAvailableAgents() {
        return agentRepo.findAvailableAgents();
    }
    
    public List<DeliveryAgent> getAllAgents() {
        return agentRepo.findAll();
    }
    
    public List<DeliveryAgent> getPendingAgents() {
        return agentRepo.findByStatus(DeliveryAgent.AgentStatus.PENDING_APPROVAL);
    }
    
    public Optional<DeliveryAgent> getAgentByEmail(String email) {
        return agentRepo.findByEmail(email);
    }
    
    public Optional<DeliveryAgent> getAgentById(Long id) {
        return agentRepo.findById(id);
    }
    
    @Transactional
    public Delivery updateDelivery(Long deliveryId, com.grubstack.delivery.web.DeliveryController.UpdateDeliveryRequest request) {
        Delivery delivery = deliveryRepo.findById(deliveryId)
                .orElseThrow(() -> new IllegalArgumentException("Delivery not found"));
        
        if (request.orderId() != null) {
            delivery.setOrderId(request.orderId());
        }
        if (request.restaurantId() != null) {
            delivery.setRestaurantId(request.restaurantId());
        }
        if (request.customerId() != null) {
            delivery.setCustomerId(request.customerId());
        }
        if (request.pickupAddress() != null) {
            delivery.setPickupAddress(request.pickupAddress());
        }
        if (request.deliveryAddress() != null) {
            delivery.setDeliveryAddress(request.deliveryAddress());
        }
        
        return deliveryRepo.save(delivery);
    }
    
    @Transactional
    public DeliveryAgent updateAgentStatus(Long agentId, DeliveryAgent.AgentStatus status) {
        DeliveryAgent agent = agentRepo.findById(agentId)
                .orElseThrow(() -> new IllegalArgumentException("Agent not found"));
        
        agent.setStatus(status);
        agent.setLastActiveAt(Instant.now());
        
        return agentRepo.save(agent);
    }
    
    @Transactional
    public DeliveryAgent approveAgent(Long agentId) {
        DeliveryAgent agent = agentRepo.findById(agentId)
                .orElseThrow(() -> new IllegalArgumentException("Agent not found"));
        
        agent.setStatus(DeliveryAgent.AgentStatus.ACTIVE);
        agent.setLastActiveAt(Instant.now());
        
        return agentRepo.save(agent);
    }
    
    
    // Auto-assignment logic
    @Transactional
    public Delivery autoAssignDelivery(Long deliveryId) {
        List<DeliveryAgent> availableAgents = agentRepo.findAvailableAgents();
        
        if (availableAgents.isEmpty()) {
            throw new IllegalArgumentException("No available agents");
        }
        
        // Simple assignment - take the first available agent
        DeliveryAgent agent = availableAgents.get(0);
        return assignDelivery(deliveryId, agent.getId());
    }
    
    private Double calculateEstimatedTime(String pickupAddress, String deliveryAddress) {
        // Simple calculation - in real app, this would use mapping service
        return 30.0; // 30 minutes default
    }
    
    @Transactional
    public void deleteAgent(Long agentId) {
        DeliveryAgent agent = agentRepo.findById(agentId)
            .orElseThrow(() -> new IllegalArgumentException("Agent not found with id: " + agentId));
        
        // Check if agent has any active deliveries
        List<Delivery> activeDeliveries = deliveryRepo.findActiveDeliveriesByAgent(agentId);
        
        if (!activeDeliveries.isEmpty()) {
            throw new IllegalArgumentException("Cannot delete agent with active deliveries. Please reassign or complete deliveries first.");
        }
        
        // Check if agent has any deliveries at all (for foreign key constraint)
        List<Delivery> allDeliveries = deliveryRepo.findByAgentId(agentId);
        
        if (!allDeliveries.isEmpty()) {
            // Set agent_id to null for all deliveries to avoid foreign key constraint
            for (Delivery delivery : allDeliveries) {
                delivery.setAgent(null);
                deliveryRepo.save(delivery);
            }
        }
        
        agentRepo.delete(agent);
    }
}