package com.grubstack.delivery.web;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.grubstack.delivery.domain.Delivery;
import com.grubstack.delivery.domain.DeliveryAgent;
import com.grubstack.delivery.service.DeliveryService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(DeliveryController.class)
class DeliveryControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private DeliveryService deliveryService;

    @Autowired
    private ObjectMapper objectMapper;

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
    void createDelivery_WithValidRequest_ShouldReturnOk() throws Exception {
        // Given
        DeliveryController.CreateDeliveryRequest request = new DeliveryController.CreateDeliveryRequest(
            1L, 2L, 3L, "123 Restaurant St", "456 Customer Ave"
        );
        when(deliveryService.createDelivery(anyLong(), anyLong(), anyLong(), anyString(), anyString()))
            .thenReturn(testDelivery);

        // When & Then
        mockMvc.perform(post("/deliveries")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.orderId").value(1))
                .andExpect(jsonPath("$.restaurantId").value(2))
                .andExpect(jsonPath("$.customerId").value(3))
                .andExpect(jsonPath("$.pickupAddress").value("123 Restaurant St"))
                .andExpect(jsonPath("$.deliveryAddress").value("456 Customer Ave"))
                .andExpect(jsonPath("$.status").value("PENDING"));
    }

    @Test
    void createDelivery_WithInvalidRequest_ShouldReturnBadRequest() throws Exception {
        // Given
        DeliveryController.CreateDeliveryRequest request = new DeliveryController.CreateDeliveryRequest(
            null, null, null, "", ""
        );
        when(deliveryService.createDelivery(anyLong(), anyLong(), anyLong(), anyString(), anyString()))
            .thenThrow(new IllegalArgumentException("Invalid data"));

        // When & Then
        mockMvc.perform(post("/deliveries")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void assignDelivery_WithValidData_ShouldReturnOk() throws Exception {
        // Given
        testDelivery.setAgent(testAgent);
        testDelivery.setStatus(Delivery.DeliveryStatus.ASSIGNED);
        when(deliveryService.assignDelivery(1L, 1L)).thenReturn(testDelivery);

        // When & Then
        mockMvc.perform(post("/deliveries/{deliveryId}/assign", 1L)
                .param("agentId", "1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("ASSIGNED"))
                .andExpect(jsonPath("$.agent.id").value(1));
    }

    @Test
    void assignDelivery_WithInvalidData_ShouldReturnBadRequest() throws Exception {
        // Given
        when(deliveryService.assignDelivery(1L, 1L))
            .thenThrow(new IllegalArgumentException("Delivery not found"));

        // When & Then
        mockMvc.perform(post("/deliveries/{deliveryId}/assign", 1L)
                .param("agentId", "1"))
                .andExpect(status().isBadRequest())
                .andExpect(header().string("X-Error-Message", "Delivery not found"));
    }

    @Test
    void autoAssignDelivery_WithValidData_ShouldReturnOk() throws Exception {
        // Given
        testDelivery.setAgent(testAgent);
        testDelivery.setStatus(Delivery.DeliveryStatus.ASSIGNED);
        when(deliveryService.autoAssignDelivery(1L)).thenReturn(testDelivery);

        // When & Then
        mockMvc.perform(post("/deliveries/{deliveryId}/auto-assign", 1L))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("ASSIGNED"));
    }

    @Test
    void autoAssignDelivery_WithNoAvailableAgents_ShouldReturnBadRequest() throws Exception {
        // Given
        when(deliveryService.autoAssignDelivery(1L))
            .thenThrow(new IllegalArgumentException("No available agents"));

        // When & Then
        mockMvc.perform(post("/deliveries/{deliveryId}/auto-assign", 1L))
                .andExpect(status().isBadRequest());
    }

    @Test
    void updateStatus_WithValidStatus_ShouldReturnOk() throws Exception {
        // Given
        testDelivery.setStatus(Delivery.DeliveryStatus.PICKED_UP);
        when(deliveryService.updateDeliveryStatus(1L, Delivery.DeliveryStatus.PICKED_UP))
            .thenReturn(testDelivery);

        // When & Then
        mockMvc.perform(put("/deliveries/{deliveryId}/status", 1L)
                .param("status", "PICKED_UP"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("PICKED_UP"));
    }

    @Test
    void updateStatus_WithInvalidDelivery_ShouldReturnBadRequest() throws Exception {
        // Given
        when(deliveryService.updateDeliveryStatus(1L, Delivery.DeliveryStatus.PICKED_UP))
            .thenThrow(new IllegalArgumentException("Delivery not found"));

        // When & Then
        mockMvc.perform(put("/deliveries/{deliveryId}/status", 1L)
                .param("status", "PICKED_UP"))
                .andExpect(status().isBadRequest())
                .andExpect(header().string("X-Error-Message", "Delivery not found"));
    }

    @Test
    void getAllDeliveries_ShouldReturnAllDeliveries() throws Exception {
        // Given
        List<Delivery> deliveries = Arrays.asList(testDelivery);
        when(deliveryService.getAllDeliveries()).thenReturn(deliveries);

        // When & Then
        mockMvc.perform(get("/deliveries"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].id").value(1))
                .andExpect(jsonPath("$[0].status").value("PENDING"));
    }

    @Test
    void getDeliveriesByCustomer_ShouldReturnCustomerDeliveries() throws Exception {
        // Given
        List<Delivery> deliveries = Arrays.asList(testDelivery);
        when(deliveryService.getDeliveriesByCustomer(3L)).thenReturn(deliveries);

        // When & Then
        mockMvc.perform(get("/deliveries/customer/{customerId}", 3L))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].customerId").value(3));
    }

    @Test
    void getDeliveriesByAgent_ShouldReturnAgentDeliveries() throws Exception {
        // Given
        List<Delivery> deliveries = Arrays.asList(testDelivery);
        when(deliveryService.getAllDeliveriesByAgent(1L)).thenReturn(deliveries);

        // When & Then
        mockMvc.perform(get("/deliveries/agent/{agentId}", 1L))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].id").value(1));
    }

    @Test
    void getDeliveryByOrder_WithExistingOrder_ShouldReturnDelivery() throws Exception {
        // Given
        when(deliveryService.getDeliveryByOrderId(1L)).thenReturn(Optional.of(testDelivery));

        // When & Then
        mockMvc.perform(get("/deliveries/order/{orderId}", 1L))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.orderId").value(1));
    }

    @Test
    void getDeliveryByOrder_WithNonExistentOrder_ShouldReturnNotFound() throws Exception {
        // Given
        when(deliveryService.getDeliveryByOrderId(1L)).thenReturn(Optional.empty());

        // When & Then
        mockMvc.perform(get("/deliveries/order/{orderId}", 1L))
                .andExpect(status().isNotFound());
    }

    @Test
    void createAgent_WithValidRequest_ShouldReturnOk() throws Exception {
        // Given
        DeliveryController.CreateAgentRequest request = new DeliveryController.CreateAgentRequest(
            "John Doe", "john@example.com", "password123", "123-456-7890", "Bike", "LIC123"
        );
        when(deliveryService.createAgent(anyString(), anyString(), anyString(), anyString(), anyString(), anyString()))
            .thenReturn(testAgent);

        // When & Then
        mockMvc.perform(post("/deliveries/agents")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.name").value("John Doe"))
                .andExpect(jsonPath("$.email").value("john@example.com"))
                .andExpect(jsonPath("$.phone").value("123-456-7890"))
                .andExpect(jsonPath("$.vehicleType").value("Bike"))
                .andExpect(jsonPath("$.licenseNumber").value("LIC123"));
    }

    @Test
    void createAgent_WithExistingEmail_ShouldReturnBadRequest() throws Exception {
        // Given
        DeliveryController.CreateAgentRequest request = new DeliveryController.CreateAgentRequest(
            "John Doe", "john@example.com", "password123", "123-456-7890", "Bike", "LIC123"
        );
        when(deliveryService.createAgent(anyString(), anyString(), anyString(), anyString(), anyString(), anyString()))
            .thenThrow(new IllegalArgumentException("Agent with this email already exists"));

        // When & Then
        mockMvc.perform(post("/deliveries/agents")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void getAllAgents_ShouldReturnAllAgents() throws Exception {
        // Given
        List<DeliveryAgent> agents = Arrays.asList(testAgent);
        when(deliveryService.getAllAgents()).thenReturn(agents);

        // When & Then
        mockMvc.perform(get("/deliveries/agents"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].id").value(1))
                .andExpect(jsonPath("$[0].name").value("John Doe"));
    }

    @Test
    void getAvailableAgents_ShouldReturnAvailableAgents() throws Exception {
        // Given
        List<DeliveryAgent> agents = Arrays.asList(testAgent);
        when(deliveryService.getAvailableAgents()).thenReturn(agents);

        // When & Then
        mockMvc.perform(get("/deliveries/agents/available"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].status").value("ACTIVE"));
    }

    @Test
    void updateAgentStatus_WithValidStatus_ShouldReturnOk() throws Exception {
        // Given
        testAgent.setStatus(DeliveryAgent.AgentStatus.INACTIVE);
        when(deliveryService.updateAgentStatus(1L, DeliveryAgent.AgentStatus.INACTIVE))
            .thenReturn(testAgent);

        // When & Then
        mockMvc.perform(put("/deliveries/agents/{agentId}/status", 1L)
                .param("status", "INACTIVE"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("INACTIVE"));
    }

    @Test
    void updateAgentStatus_WithInvalidAgent_ShouldReturnBadRequest() throws Exception {
        // Given
        when(deliveryService.updateAgentStatus(1L, DeliveryAgent.AgentStatus.INACTIVE))
            .thenThrow(new IllegalArgumentException("Agent not found"));

        // When & Then
        mockMvc.perform(put("/deliveries/agents/{agentId}/status", 1L)
                .param("status", "INACTIVE"))
                .andExpect(status().isBadRequest());
    }
}
