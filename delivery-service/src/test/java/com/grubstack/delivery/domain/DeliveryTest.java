package com.grubstack.delivery.domain;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.time.Instant;

import static org.junit.jupiter.api.Assertions.*;

class DeliveryTest {

    private Delivery delivery;

    @BeforeEach
    void setUp() {
        delivery = new Delivery(1L, 2L, 3L, "123 Restaurant St", "456 Customer Ave");
    }

    @Test
    void constructor_WithValidData_ShouldSetProperties() {
        // Given & When
        Delivery newDelivery = new Delivery(1L, 2L, 3L, "123 Restaurant St", "456 Customer Ave");

        // Then
        assertEquals(1L, newDelivery.getOrderId());
        assertEquals(2L, newDelivery.getRestaurantId());
        assertEquals(3L, newDelivery.getCustomerId());
        assertEquals("123 Restaurant St", newDelivery.getPickupAddress());
        assertEquals("456 Customer Ave", newDelivery.getDeliveryAddress());
        assertEquals(Delivery.DeliveryStatus.PENDING, newDelivery.getStatus());
        assertNotNull(newDelivery.getCreatedAt());
    }

    @Test
    void constructor_DefaultConstructor_ShouldCreateEmptyDelivery() {
        // Given & When
        Delivery emptyDelivery = new Delivery();

        // Then
        assertNull(emptyDelivery.getOrderId());
        assertNull(emptyDelivery.getRestaurantId());
        assertNull(emptyDelivery.getCustomerId());
        assertNull(emptyDelivery.getPickupAddress());
        assertNull(emptyDelivery.getDeliveryAddress());
        assertEquals(Delivery.DeliveryStatus.PENDING, emptyDelivery.getStatus());
        assertNull(emptyDelivery.getCreatedAt());
    }

    @Test
    void settersAndGetters_ShouldWorkCorrectly() {
        // Given
        DeliveryAgent agent = new DeliveryAgent("John Doe", "john@example.com", "123-456-7890", "Bike", "LIC123");
        Instant now = Instant.now();

        // When
        delivery.setId(1L);
        delivery.setAgent(agent);
        delivery.setStatus(Delivery.DeliveryStatus.ASSIGNED);
        delivery.setAssignedAt(now);
        delivery.setPickedUpAt(now);
        delivery.setDeliveredAt(now);
        delivery.setNotes("Handle with care");
        delivery.setEstimatedDeliveryTime(45.0);

        // Then
        assertEquals(1L, delivery.getId());
        assertEquals(agent, delivery.getAgent());
        assertEquals(Delivery.DeliveryStatus.ASSIGNED, delivery.getStatus());
        assertEquals(now, delivery.getAssignedAt());
        assertEquals(now, delivery.getPickedUpAt());
        assertEquals(now, delivery.getDeliveredAt());
        assertEquals("Handle with care", delivery.getNotes());
        assertEquals(45.0, delivery.getEstimatedDeliveryTime());
    }

    @Test
    void deliveryStatus_Enum_ShouldHaveCorrectValues() {
        // Then
        assertEquals("PENDING", Delivery.DeliveryStatus.PENDING.name());
        assertEquals("ASSIGNED", Delivery.DeliveryStatus.ASSIGNED.name());
        assertEquals("PICKED_UP", Delivery.DeliveryStatus.PICKED_UP.name());
        assertEquals("IN_TRANSIT", Delivery.DeliveryStatus.IN_TRANSIT.name());
        assertEquals("DELIVERED", Delivery.DeliveryStatus.DELIVERED.name());
        assertEquals("CANCELLED", Delivery.DeliveryStatus.CANCELLED.name());
    }

    @Test
    void deliveryStatus_Enum_ShouldHaveCorrectOrdinalValues() {
        // Then
        assertEquals(0, Delivery.DeliveryStatus.PENDING.ordinal());
        assertEquals(1, Delivery.DeliveryStatus.ASSIGNED.ordinal());
        assertEquals(2, Delivery.DeliveryStatus.PICKED_UP.ordinal());
        assertEquals(3, Delivery.DeliveryStatus.IN_TRANSIT.ordinal());
        assertEquals(4, Delivery.DeliveryStatus.DELIVERED.ordinal());
        assertEquals(5, Delivery.DeliveryStatus.CANCELLED.ordinal());
    }

    @Test
    void deliveryStatus_ValueOf_ShouldReturnCorrectStatus() {
        // When & Then
        assertEquals(Delivery.DeliveryStatus.PENDING, Delivery.DeliveryStatus.valueOf("PENDING"));
        assertEquals(Delivery.DeliveryStatus.ASSIGNED, Delivery.DeliveryStatus.valueOf("ASSIGNED"));
        assertEquals(Delivery.DeliveryStatus.PICKED_UP, Delivery.DeliveryStatus.valueOf("PICKED_UP"));
        assertEquals(Delivery.DeliveryStatus.IN_TRANSIT, Delivery.DeliveryStatus.valueOf("IN_TRANSIT"));
        assertEquals(Delivery.DeliveryStatus.DELIVERED, Delivery.DeliveryStatus.valueOf("DELIVERED"));
        assertEquals(Delivery.DeliveryStatus.CANCELLED, Delivery.DeliveryStatus.valueOf("CANCELLED"));
    }

    @Test
    void deliveryStatus_Values_ShouldReturnAllStatuses() {
        // When
        Delivery.DeliveryStatus[] statuses = Delivery.DeliveryStatus.values();

        // Then
        assertEquals(6, statuses.length);
        assertArrayEquals(new Delivery.DeliveryStatus[]{
            Delivery.DeliveryStatus.PENDING,
            Delivery.DeliveryStatus.ASSIGNED,
            Delivery.DeliveryStatus.PICKED_UP,
            Delivery.DeliveryStatus.IN_TRANSIT,
            Delivery.DeliveryStatus.DELIVERED,
            Delivery.DeliveryStatus.CANCELLED
        }, statuses);
    }
}
