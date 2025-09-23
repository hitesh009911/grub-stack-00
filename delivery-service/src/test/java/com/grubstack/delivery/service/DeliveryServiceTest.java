package com.grubstack.delivery.service;

import com.grubstack.delivery.domain.Delivery;
import com.grubstack.delivery.domain.DeliveryAgent;
import com.grubstack.delivery.repo.DeliveryRepository;
import com.grubstack.delivery.repo.DeliveryAgentRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class DeliveryServiceTest {

    @Mock
    private DeliveryRepository deliveryRepo;

    @Mock
    private DeliveryAgentRepository agentRepo;

    @InjectMocks
    private DeliveryService deliveryService;

    private Delivery testDelivery;
    private DeliveryAgent testAgent;

    @BeforeEach
    void setUp() {
        testDelivery = new Delivery(1L, 2L, 3L, "123 Restaurant St", "456 Customer Ave");
        testDelivery.setId(1L);
        testDelivery.setStatus(Delivery.DeliveryStatus.PENDING);

        testAgent = new DeliveryAgent("John Doe", "john@example.com", "123-456-7890", "Bike", "LIC123");
        testAgent.setId(1L);
        testAgent.setStatus(DeliveryAgent.AgentStatus.ACTIVE);
    }

    @Test
    void createDelivery_ShouldReturnSavedDelivery() {
        // Given
        when(deliveryRepo.save(any(Delivery.class))).thenReturn(testDelivery);

        // When
        Delivery result = deliveryService.createDelivery(1L, 2L, 3L, "123 Restaurant St", "456 Customer Ave");

        // Then
        assertNotNull(result);
        assertEquals(1L, result.getOrderId());
        assertEquals(2L, result.getRestaurantId());
        assertEquals(3L, result.getCustomerId());
        assertEquals("123 Restaurant St", result.getPickupAddress());
        assertEquals("456 Customer Ave", result.getDeliveryAddress());
        assertEquals(Delivery.DeliveryStatus.PENDING, result.getStatus());
        assertEquals(30.0, result.getEstimatedDeliveryTime());
        verify(deliveryRepo).save(any(Delivery.class));
    }

    @Test
    void assignDelivery_WithValidData_ShouldAssignAgentAndUpdateStatus() {
        // Given
        when(deliveryRepo.findById(1L)).thenReturn(Optional.of(testDelivery));
        when(agentRepo.findById(1L)).thenReturn(Optional.of(testAgent));
        when(deliveryRepo.save(any(Delivery.class))).thenReturn(testDelivery);
        when(agentRepo.save(any(DeliveryAgent.class))).thenReturn(testAgent);

        // When
        Delivery result = deliveryService.assignDelivery(1L, 1L);

        // Then
        assertNotNull(result);
        assertEquals(testAgent, result.getAgent());
        assertEquals(Delivery.DeliveryStatus.ASSIGNED, result.getStatus());
        assertNotNull(result.getAssignedAt());
        assertEquals(DeliveryAgent.AgentStatus.ACTIVE, testAgent.getStatus());
        
        verify(deliveryRepo).save(testDelivery);
        verify(agentRepo).save(testAgent);
    }

    @Test
    void assignDelivery_WithNonExistentDelivery_ShouldThrowException() {
        // Given
        when(deliveryRepo.findById(1L)).thenReturn(Optional.empty());

        // When & Then
        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, 
            () -> deliveryService.assignDelivery(1L, 1L));
        assertEquals("Delivery not found", exception.getMessage());
    }

    @Test
    void assignDelivery_WithNonExistentAgent_ShouldThrowException() {
        // Given
        when(deliveryRepo.findById(1L)).thenReturn(Optional.of(testDelivery));
        when(agentRepo.findById(1L)).thenReturn(Optional.empty());

        // When & Then
        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, 
            () -> deliveryService.assignDelivery(1L, 1L));
        assertEquals("Agent not found", exception.getMessage());
    }

    @Test
    void assignDelivery_WithInactiveAgent_ShouldThrowException() {
        // Given
        testAgent.setStatus(DeliveryAgent.AgentStatus.INACTIVE);
        when(deliveryRepo.findById(1L)).thenReturn(Optional.of(testDelivery));
        when(agentRepo.findById(1L)).thenReturn(Optional.of(testAgent));

        // When & Then
        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, 
            () -> deliveryService.assignDelivery(1L, 1L));
        assertEquals("Agent is inactive and cannot be assigned deliveries", exception.getMessage());
    }

    @Test
    void assignDelivery_WithExistingAgent_ShouldMakeOldAgentAvailable() {
        // Given
        DeliveryAgent oldAgent = new DeliveryAgent("Old Agent", "old@example.com", "111-222-3333", "Car", "OLD123");
        oldAgent.setId(2L);
        testDelivery.setAgent(oldAgent);
        
        when(deliveryRepo.findById(1L)).thenReturn(Optional.of(testDelivery));
        when(agentRepo.findById(1L)).thenReturn(Optional.of(testAgent));
        when(deliveryRepo.save(any(Delivery.class))).thenReturn(testDelivery);
        when(agentRepo.save(any(DeliveryAgent.class))).thenReturn(testAgent);

        // When
        deliveryService.assignDelivery(1L, 1L);

        // Then
        verify(agentRepo).save(oldAgent);
        assertEquals(DeliveryAgent.AgentStatus.ACTIVE, oldAgent.getStatus());
    }

    @Test
    void updateDeliveryStatus_ToPickedUp_ShouldSetPickedUpAt() {
        // Given
        when(deliveryRepo.findById(1L)).thenReturn(Optional.of(testDelivery));
        when(deliveryRepo.save(any(Delivery.class))).thenReturn(testDelivery);

        // When
        Delivery result = deliveryService.updateDeliveryStatus(1L, Delivery.DeliveryStatus.PICKED_UP);

        // Then
        assertEquals(Delivery.DeliveryStatus.PICKED_UP, result.getStatus());
        assertNotNull(result.getPickedUpAt());
        verify(deliveryRepo).save(testDelivery);
    }

    @Test
    void updateDeliveryStatus_ToDelivered_ShouldSetDeliveredAtAndMakeAgentAvailable() {
        // Given
        testDelivery.setAgent(testAgent);
        when(deliveryRepo.findById(1L)).thenReturn(Optional.of(testDelivery));
        when(deliveryRepo.save(any(Delivery.class))).thenReturn(testDelivery);
        when(agentRepo.save(any(DeliveryAgent.class))).thenReturn(testAgent);

        // When
        Delivery result = deliveryService.updateDeliveryStatus(1L, Delivery.DeliveryStatus.DELIVERED);

        // Then
        assertEquals(Delivery.DeliveryStatus.DELIVERED, result.getStatus());
        assertNotNull(result.getDeliveredAt());
        assertEquals(DeliveryAgent.AgentStatus.ACTIVE, testAgent.getStatus());
        verify(agentRepo).save(testAgent);
    }

    @Test
    void getPendingDeliveries_ShouldReturnPendingDeliveries() {
        // Given
        List<Delivery> pendingDeliveries = Arrays.asList(testDelivery);
        when(deliveryRepo.findPendingDeliveries()).thenReturn(pendingDeliveries);

        // When
        List<Delivery> result = deliveryService.getPendingDeliveries();

        // Then
        assertEquals(1, result.size());
        assertEquals(testDelivery, result.get(0));
        verify(deliveryRepo).findPendingDeliveries();
    }

    @Test
    void getDeliveriesByCustomer_ShouldReturnCustomerDeliveries() {
        // Given
        List<Delivery> customerDeliveries = Arrays.asList(testDelivery);
        when(deliveryRepo.findByCustomerId(3L)).thenReturn(customerDeliveries);

        // When
        List<Delivery> result = deliveryService.getDeliveriesByCustomer(3L);

        // Then
        assertEquals(1, result.size());
        assertEquals(testDelivery, result.get(0));
        verify(deliveryRepo).findByCustomerId(3L);
    }

    @Test
    void createAgent_WithValidData_ShouldCreateAgent() {
        // Given
        when(agentRepo.findByEmail("john@example.com")).thenReturn(Optional.empty());
        when(agentRepo.save(any(DeliveryAgent.class))).thenReturn(testAgent);

        // When
        DeliveryAgent result = deliveryService.createAgent("John Doe", "john@example.com", 
            "password123", "123-456-7890", "Bike", "LIC123");

        // Then
        assertNotNull(result);
        assertEquals("John Doe", result.getName());
        assertEquals("john@example.com", result.getEmail());
        assertEquals("123-456-7890", result.getPhone());
        assertEquals("Bike", result.getVehicleType());
        assertEquals("LIC123", result.getLicenseNumber());
        verify(agentRepo).save(any(DeliveryAgent.class));
    }

    @Test
    void createAgent_WithExistingEmail_ShouldThrowException() {
        // Given
        when(agentRepo.findByEmail("john@example.com")).thenReturn(Optional.of(testAgent));

        // When & Then
        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, 
            () -> deliveryService.createAgent("John Doe", "john@example.com", 
                "password123", "123-456-7890", "Bike", "LIC123"));
        assertEquals("Agent with this email already exists", exception.getMessage());
    }

    @Test
    void getAvailableAgents_ShouldReturnAvailableAgents() {
        // Given
        List<DeliveryAgent> availableAgents = Arrays.asList(testAgent);
        when(agentRepo.findAvailableAgents()).thenReturn(availableAgents);

        // When
        List<DeliveryAgent> result = deliveryService.getAvailableAgents();

        // Then
        assertEquals(1, result.size());
        assertEquals(testAgent, result.get(0));
        verify(agentRepo).findAvailableAgents();
    }

    @Test
    void updateAgentStatus_ShouldUpdateStatusAndLastActiveAt() {
        // Given
        when(agentRepo.findById(1L)).thenReturn(Optional.of(testAgent));
        when(agentRepo.save(any(DeliveryAgent.class))).thenReturn(testAgent);

        // When
        DeliveryAgent result = deliveryService.updateAgentStatus(1L, DeliveryAgent.AgentStatus.INACTIVE);

        // Then
        assertEquals(DeliveryAgent.AgentStatus.INACTIVE, result.getStatus());
        assertNotNull(result.getLastActiveAt());
        verify(agentRepo).save(testAgent);
    }

    @Test
    void autoAssignDelivery_WithAvailableAgents_ShouldAssignFirstAgent() {
        // Given
        List<DeliveryAgent> availableAgents = Arrays.asList(testAgent);
        when(deliveryRepo.findById(1L)).thenReturn(Optional.of(testDelivery));
        when(agentRepo.findAvailableAgents()).thenReturn(availableAgents);
        when(deliveryRepo.save(any(Delivery.class))).thenReturn(testDelivery);
        when(agentRepo.save(any(DeliveryAgent.class))).thenReturn(testAgent);

        // When
        Delivery result = deliveryService.autoAssignDelivery(1L);

        // Then
        assertEquals(testAgent, result.getAgent());
        assertEquals(Delivery.DeliveryStatus.ASSIGNED, result.getStatus());
        verify(deliveryRepo).save(testDelivery);
        verify(agentRepo).save(testAgent);
    }

    @Test
    void autoAssignDelivery_WithNoAvailableAgents_ShouldThrowException() {
        // Given
        when(deliveryRepo.findById(1L)).thenReturn(Optional.of(testDelivery));
        when(agentRepo.findAvailableAgents()).thenReturn(Arrays.asList());

        // When & Then
        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, 
            () -> deliveryService.autoAssignDelivery(1L));
        assertEquals("No available agents", exception.getMessage());
    }
}
