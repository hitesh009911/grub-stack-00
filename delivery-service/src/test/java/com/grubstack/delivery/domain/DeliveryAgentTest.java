package com.grubstack.delivery.domain;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.time.Instant;

import static org.junit.jupiter.api.Assertions.*;

class DeliveryAgentTest {

    private DeliveryAgent agent;

    @BeforeEach
    void setUp() {
        agent = new DeliveryAgent("John Doe", "john@example.com", "123-456-7890", "Bike", "LIC123");
    }

    @Test
    void constructor_WithValidData_ShouldSetProperties() {
        // Given & When
        DeliveryAgent newAgent = new DeliveryAgent("Jane Smith", "jane@example.com", "987-654-3210", "Car", "LIC456");

        // Then
        assertEquals("Jane Smith", newAgent.getName());
        assertEquals("jane@example.com", newAgent.getEmail());
        assertEquals("987-654-3210", newAgent.getPhone());
        assertEquals("Car", newAgent.getVehicleType());
        assertEquals("LIC456", newAgent.getLicenseNumber());
        assertEquals(DeliveryAgent.AgentStatus.AVAILABLE, newAgent.getStatus());
        assertNotNull(newAgent.getCreatedAt());
        assertNotNull(newAgent.getLastActiveAt());
    }

    @Test
    void constructor_DefaultConstructor_ShouldCreateEmptyAgent() {
        // Given & When
        DeliveryAgent emptyAgent = new DeliveryAgent();

        // Then
        assertNull(emptyAgent.getName());
        assertNull(emptyAgent.getEmail());
        assertNull(emptyAgent.getPhone());
        assertNull(emptyAgent.getVehicleType());
        assertNull(emptyAgent.getLicenseNumber());
        assertEquals(DeliveryAgent.AgentStatus.AVAILABLE, emptyAgent.getStatus());
        assertNull(emptyAgent.getCreatedAt());
        assertNull(emptyAgent.getLastActiveAt());
    }

    @Test
    void settersAndGetters_ShouldWorkCorrectly() {
        // Given
        Instant now = Instant.now();

        // When
        agent.setId(1L);
        agent.setName("Updated Name");
        agent.setEmail("updated@example.com");
        agent.setPhone("111-222-3333");
        agent.setStatus(DeliveryAgent.AgentStatus.BUSY);
        agent.setVehicleType("Motorcycle");
        agent.setLicenseNumber("UPD123");
        agent.setCreatedAt(now);
        agent.setLastActiveAt(now);

        // Then
        assertEquals(1L, agent.getId());
        assertEquals("Updated Name", agent.getName());
        assertEquals("updated@example.com", agent.getEmail());
        assertEquals("111-222-3333", agent.getPhone());
        assertEquals(DeliveryAgent.AgentStatus.BUSY, agent.getStatus());
        assertEquals("Motorcycle", agent.getVehicleType());
        assertEquals("UPD123", agent.getLicenseNumber());
        assertEquals(now, agent.getCreatedAt());
        assertEquals(now, agent.getLastActiveAt());
    }

    @Test
    void agentStatus_Enum_ShouldHaveCorrectValues() {
        // Then
        assertEquals("AVAILABLE", DeliveryAgent.AgentStatus.AVAILABLE.name());
        assertEquals("BUSY", DeliveryAgent.AgentStatus.BUSY.name());
        assertEquals("OFFLINE", DeliveryAgent.AgentStatus.OFFLINE.name());
    }

    @Test
    void agentStatus_Enum_ShouldHaveCorrectOrdinalValues() {
        // Then
        assertEquals(0, DeliveryAgent.AgentStatus.AVAILABLE.ordinal());
        assertEquals(1, DeliveryAgent.AgentStatus.BUSY.ordinal());
        assertEquals(2, DeliveryAgent.AgentStatus.OFFLINE.ordinal());
    }

    @Test
    void agentStatus_ValueOf_ShouldReturnCorrectStatus() {
        // When & Then
        assertEquals(DeliveryAgent.AgentStatus.AVAILABLE, DeliveryAgent.AgentStatus.valueOf("AVAILABLE"));
        assertEquals(DeliveryAgent.AgentStatus.BUSY, DeliveryAgent.AgentStatus.valueOf("BUSY"));
        assertEquals(DeliveryAgent.AgentStatus.OFFLINE, DeliveryAgent.AgentStatus.valueOf("OFFLINE"));
    }

    @Test
    void agentStatus_Values_ShouldReturnAllStatuses() {
        // When
        DeliveryAgent.AgentStatus[] statuses = DeliveryAgent.AgentStatus.values();

        // Then
        assertEquals(3, statuses.length);
        assertArrayEquals(new DeliveryAgent.AgentStatus[]{
            DeliveryAgent.AgentStatus.AVAILABLE,
            DeliveryAgent.AgentStatus.BUSY,
            DeliveryAgent.AgentStatus.OFFLINE
        }, statuses);
    }

    @Test
    void createdAt_ShouldBeSetInConstructor() {
        // Given
        Instant beforeCreation = Instant.now();

        // When
        DeliveryAgent newAgent = new DeliveryAgent("Test", "test@example.com", "123", "Bike", "TEST123");
        Instant afterCreation = Instant.now();

        // Then
        assertNotNull(newAgent.getCreatedAt());
        assertTrue(newAgent.getCreatedAt().isAfter(beforeCreation.minusSeconds(1)));
        assertTrue(newAgent.getCreatedAt().isBefore(afterCreation.plusSeconds(1)));
    }

    @Test
    void lastActiveAt_ShouldBeSetInConstructor() {
        // Given
        Instant beforeCreation = Instant.now();

        // When
        DeliveryAgent newAgent = new DeliveryAgent("Test", "test@example.com", "123", "Bike", "TEST123");
        Instant afterCreation = Instant.now();

        // Then
        assertNotNull(newAgent.getLastActiveAt());
        assertTrue(newAgent.getLastActiveAt().isAfter(beforeCreation.minusSeconds(1)));
        assertTrue(newAgent.getLastActiveAt().isBefore(afterCreation.plusSeconds(1)));
    }
}
