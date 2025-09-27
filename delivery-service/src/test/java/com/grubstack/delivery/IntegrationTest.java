package com.grubstack.delivery;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.grubstack.delivery.domain.Delivery;
import com.grubstack.delivery.domain.DeliveryAgent;
import com.grubstack.delivery.repo.DeliveryAgentRepository;
import com.grubstack.delivery.repo.DeliveryRepository;
import com.grubstack.delivery.web.DeliveryController;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureWebMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureWebMvc
@ActiveProfiles("test")
@Transactional
class IntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private DeliveryRepository deliveryRepository;

    @Autowired
    private DeliveryAgentRepository agentRepository;

    @Autowired
    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        // Clean up database before each test
        deliveryRepository.deleteAll();
        agentRepository.deleteAll();
    }

    @Test
    void createAndAssignDelivery_IntegrationTest() throws Exception {
        // 1. Create a delivery agent
        DeliveryController.CreateAgentRequest agentRequest = new DeliveryController.CreateAgentRequest(
            "John Doe", "john@example.com", "password123", "123-456-7890", "Bike", "LIC123"
        );

        mockMvc.perform(post("/deliveries/agents")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(agentRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("John Doe"))
                .andExpect(jsonPath("$.status").value("AVAILABLE"));

        // 2. Create a delivery
        DeliveryController.CreateDeliveryRequest deliveryRequest = new DeliveryController.CreateDeliveryRequest(
            1L, 2L, 3L, "123 Restaurant St", "456 Customer Ave"
        );

        mockMvc.perform(post("/deliveries")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(deliveryRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.orderId").value(1))
                .andExpect(jsonPath("$.status").value("PENDING"));

        // 3. Assign the delivery to the agent
        mockMvc.perform(post("/deliveries/{deliveryId}/assign", 1L)
                .param("agentId", "1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("ASSIGNED"))
                .andExpect(jsonPath("$.agent.id").value(1));

        // 4. Update delivery status to picked up
        mockMvc.perform(put("/deliveries/{deliveryId}/status", 1L)
                .param("status", "PICKED_UP"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("PICKED_UP"));

        // 5. Update delivery status to delivered
        mockMvc.perform(put("/deliveries/{deliveryId}/status", 1L)
                .param("status", "DELIVERED"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("DELIVERED"));

        // 6. Verify agent is available again
        mockMvc.perform(get("/deliveries/agents/available"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].status").value("AVAILABLE"));
    }

    @Test
    void autoAssignDelivery_IntegrationTest() throws Exception {
        // 1. Create multiple delivery agents
        DeliveryAgent agent1 = new DeliveryAgent("Agent 1", "agent1@example.com", "111-111-1111", "Bike", "LIC001");
        DeliveryAgent agent2 = new DeliveryAgent("Agent 2", "agent2@example.com", "222-222-2222", "Car", "LIC002");
        agentRepository.save(agent1);
        agentRepository.save(agent2);

        // 2. Create a delivery
        Delivery delivery = new Delivery(1L, 2L, 3L, "123 Restaurant St", "456 Customer Ave");
        deliveryRepository.save(delivery);

        // 3. Auto-assign the delivery
        mockMvc.perform(post("/deliveries/{deliveryId}/auto-assign", delivery.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("ASSIGNED"))
                .andExpect(jsonPath("$.agent").exists());

        // 4. Verify the agent is now busy
        mockMvc.perform(get("/deliveries/agents/available"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(1));
    }

    @Test
    void getDeliveriesByCustomer_IntegrationTest() throws Exception {
        // 1. Create delivery agent
        DeliveryAgent agent = new DeliveryAgent("John Doe", "john@example.com", "123-456-7890", "Bike", "LIC123");
        agentRepository.save(agent);

        // 2. Create deliveries for different customers
        Delivery delivery1 = new Delivery(1L, 2L, 100L, "Restaurant 1", "Customer 100 Address");
        Delivery delivery2 = new Delivery(2L, 3L, 100L, "Restaurant 2", "Customer 100 Address");
        Delivery delivery3 = new Delivery(3L, 4L, 200L, "Restaurant 3", "Customer 200 Address");
        
        deliveryRepository.save(delivery1);
        deliveryRepository.save(delivery2);
        deliveryRepository.save(delivery3);

        // 3. Get deliveries for customer 100
        mockMvc.perform(get("/deliveries/customer/{customerId}", 100L))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].customerId").value(100))
                .andExpect(jsonPath("$[1].customerId").value(100));

        // 4. Get deliveries for customer 200
        mockMvc.perform(get("/deliveries/customer/{customerId}", 200L))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].customerId").value(200));
    }

    @Test
    void getDeliveriesByAgent_IntegrationTest() throws Exception {
        // 1. Create delivery agents
        DeliveryAgent agent1 = new DeliveryAgent("Agent 1", "agent1@example.com", "111-111-1111", "Bike", "LIC001");
        DeliveryAgent agent2 = new DeliveryAgent("Agent 2", "agent2@example.com", "222-222-2222", "Car", "LIC002");
        agentRepository.save(agent1);
        agentRepository.save(agent2);

        // 2. Create deliveries and assign them to agents
        Delivery delivery1 = new Delivery(1L, 2L, 100L, "Restaurant 1", "Customer 100 Address");
        Delivery delivery2 = new Delivery(2L, 3L, 200L, "Restaurant 2", "Customer 200 Address");
        Delivery delivery3 = new Delivery(3L, 4L, 300L, "Restaurant 3", "Customer 300 Address");
        
        delivery1.setAgent(agent1);
        delivery1.setStatus(Delivery.DeliveryStatus.ASSIGNED);
        delivery2.setAgent(agent1);
        delivery2.setStatus(Delivery.DeliveryStatus.PICKED_UP);
        delivery3.setAgent(agent2);
        delivery3.setStatus(Delivery.DeliveryStatus.ASSIGNED);
        
        deliveryRepository.save(delivery1);
        deliveryRepository.save(delivery2);
        deliveryRepository.save(delivery3);

        // 3. Get deliveries for agent 1
        mockMvc.perform(get("/deliveries/agent/{agentId}", agent1.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].agent.id").value(agent1.getId()))
                .andExpect(jsonPath("$[1].agent.id").value(agent1.getId()));

        // 4. Get deliveries for agent 2
        mockMvc.perform(get("/deliveries/agent/{agentId}", agent2.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].agent.id").value(agent2.getId()));
    }

    @Test
    void updateAgentStatus_IntegrationTest() throws Exception {
        // 1. Create a delivery agent
        DeliveryAgent agent = new DeliveryAgent("John Doe", "john@example.com", "123-456-7890", "Bike", "LIC123");
        agentRepository.save(agent);

        // 2. Verify agent is available
        mockMvc.perform(get("/deliveries/agents/available"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].status").value("AVAILABLE"));

        // 3. Update agent status to busy
        mockMvc.perform(put("/deliveries/agents/{agentId}/status", agent.getId())
                .param("status", "BUSY"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("BUSY"));

        // 4. Verify agent is no longer available
        mockMvc.perform(get("/deliveries/agents/available"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(0));

        // 5. Update agent status to offline
        mockMvc.perform(put("/deliveries/agents/{agentId}/status", agent.getId())
                .param("status", "OFFLINE"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("OFFLINE"));
    }

    @Test
    void getDeliveryByOrder_IntegrationTest() throws Exception {
        // 1. Create a delivery
        Delivery delivery = new Delivery(123L, 456L, 789L, "Restaurant Address", "Customer Address");
        deliveryRepository.save(delivery);

        // 2. Get delivery by order ID
        mockMvc.perform(get("/deliveries/order/{orderId}", 123L))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.orderId").value(123))
                .andExpect(jsonPath("$.restaurantId").value(456))
                .andExpect(jsonPath("$.customerId").value(789));

        // 3. Try to get non-existent order
        mockMvc.perform(get("/deliveries/order/{orderId}", 999L))
                .andExpect(status().isNotFound());
    }

    @Test
    void errorHandling_IntegrationTest() throws Exception {
        // 1. Try to assign delivery to non-existent agent
        Delivery delivery = new Delivery(1L, 2L, 3L, "Restaurant Address", "Customer Address");
        deliveryRepository.save(delivery);

        mockMvc.perform(post("/deliveries/{deliveryId}/assign", delivery.getId())
                .param("agentId", "999"))
                .andExpect(status().isBadRequest())
                .andExpect(header().exists("X-Error-Message"));

        // 2. Try to assign non-existent delivery
        DeliveryAgent agent = new DeliveryAgent("John Doe", "john@example.com", "123-456-7890", "Bike", "LIC123");
        agentRepository.save(agent);

        mockMvc.perform(post("/deliveries/{deliveryId}/assign", 999L)
                .param("agentId", agent.getId().toString()))
                .andExpect(status().isBadRequest())
                .andExpect(header().exists("X-Error-Message"));

        // 3. Try to create agent with duplicate email
        mockMvc.perform(post("/deliveries/agents")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(new DeliveryController.CreateAgentRequest(
                    "Another Agent", "john@example.com", "password456", "987-654-3210", "Car", "LIC456"))))
                .andExpect(status().isBadRequest());
    }
}
