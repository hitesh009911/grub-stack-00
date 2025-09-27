package com.grubstack.delivery.web;

import com.grubstack.delivery.domain.Delivery;
import com.grubstack.delivery.domain.DeliveryAgent;
import com.grubstack.delivery.service.DeliveryService;
import com.grubstack.delivery.service.NotificationService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/deliveries")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173", "http://localhost:8081"})
public class DeliveryController {
    
    private final DeliveryService deliveryService;
    private final NotificationService notificationService;
    private final RestTemplate restTemplate;
    
    public DeliveryController(DeliveryService deliveryService, NotificationService notificationService) {
        this.deliveryService = deliveryService;
        this.notificationService = notificationService;
        this.restTemplate = new RestTemplate();
    }
    
    // Delivery Management
    @PostMapping
    public ResponseEntity<Delivery> createDelivery(@Valid @RequestBody CreateDeliveryRequest request) {
        try {
            Delivery delivery = deliveryService.createDelivery(
                request.orderId(),
                request.restaurantId(),
                request.customerId(),
                request.pickupAddress(),
                request.deliveryAddress()
            );
            return ResponseEntity.ok(delivery);
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @PostMapping("/{deliveryId}/assign")
    public ResponseEntity<Delivery> assignDelivery(@PathVariable("deliveryId") Long deliveryId, 
                                                 @RequestParam("agentId") Long agentId) {
        try {
            Delivery delivery = deliveryService.assignDelivery(deliveryId, agentId);
            return ResponseEntity.ok(delivery);
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest()
                    .header("X-Error-Message", ex.getMessage())
                    .build();
        }
    }
    
    @PostMapping("/{deliveryId}/auto-assign")
    public ResponseEntity<Delivery> autoAssignDelivery(@PathVariable("deliveryId") Long deliveryId) {
        try {
            Delivery delivery = deliveryService.autoAssignDelivery(deliveryId);
            return ResponseEntity.ok(delivery);
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @PutMapping("/{deliveryId}/status")
    public ResponseEntity<Delivery> updateStatus(@PathVariable("deliveryId") Long deliveryId,
                                               @RequestParam("status") Delivery.DeliveryStatus status) {
        try {
            Delivery delivery = deliveryService.updateDeliveryStatus(deliveryId, status);
            return ResponseEntity.ok(delivery);
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest()
                    .header("X-Error-Message", ex.getMessage())
                    .build();
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .header("X-Error-Message", ex.getMessage())
                    .build();
        }
    }
    
    @GetMapping
    public ResponseEntity<List<Delivery>> getAllDeliveries() {
        return ResponseEntity.ok(deliveryService.getAllDeliveries());
    }
    
    @GetMapping("/customer/{customerId}")
    public ResponseEntity<List<Delivery>> getDeliveriesByCustomer(@PathVariable("customerId") Long customerId) {
        return ResponseEntity.ok(deliveryService.getDeliveriesByCustomer(customerId));
    }
    
    @GetMapping("/agent/{agentId}")
    public ResponseEntity<List<Delivery>> getDeliveriesByAgent(@PathVariable("agentId") Long agentId) {
        try {
            List<Delivery> deliveries = deliveryService.getAllDeliveriesByAgent(agentId);
            return ResponseEntity.ok(deliveries);
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .header("X-Error-Message", ex.getMessage())
                    .build();
        }
    }
    
    @GetMapping("/order/{orderId}")
    public ResponseEntity<Delivery> getDeliveryByOrder(@PathVariable("orderId") Long orderId) {
        return deliveryService.getDeliveryByOrderId(orderId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    @PutMapping("/{deliveryId}")
    public ResponseEntity<Delivery> updateDelivery(@PathVariable("deliveryId") Long deliveryId, 
                                                 @RequestBody UpdateDeliveryRequest request) {
        try {
            Delivery delivery = deliveryService.updateDelivery(deliveryId, request);
            return ResponseEntity.ok(delivery);
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest()
                    .header("X-Error-Message", ex.getMessage())
                    .build();
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .header("X-Error-Message", ex.getMessage())
                    .build();
        }
    }
    
    // Agent Management
    @PostMapping("/agents")
    public ResponseEntity<?> createAgent(@RequestBody CreateAgentRequest request) {
        try {
            System.out.println("Creating agent with: " + request);
            DeliveryAgent agent = deliveryService.createAgent(
                request.name(),
                request.email(),
                request.phone(),
                request.vehicleType(),
                request.licenseNumber(),
                request.password()
            );
            System.out.println("Agent created successfully: " + agent.getId());
            
            // Send registration acknowledgment notification via direct endpoint (outside transaction)
            try {
                restTemplate.postForObject(
                    "http://localhost:8089/notifications/delivery-agent-registration?email={email}&agentName={name}&phone={phone}&vehicleType={vehicleType}",
                    null,
                    Object.class,
                    agent.getEmail(),
                    agent.getName(),
                    agent.getPhone(),
                    agent.getVehicleType()
                );
            } catch (Exception e) {
                System.err.println("Failed to send registration acknowledgment: " + e.getMessage());
                // Don't fail the request if notification fails
            }
            
            return ResponseEntity.ok(agent);
        } catch (IllegalArgumentException ex) {
            System.err.println("IllegalArgumentException: " + ex.getMessage());
            return ResponseEntity.badRequest()
                    .body(new HashMap<String, String>() {{ put("error", ex.getMessage()); }});
        } catch (Exception ex) {
            System.err.println("Unexpected error: " + ex.getMessage());
            ex.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new HashMap<String, String>() {{ put("error", ex.getMessage()); }});
        }
    }
    
    // Agent Management (Admin creates agent without password)
    @PostMapping("/agents/admin")
    public ResponseEntity<?> createAgentByAdmin(@Valid @RequestBody CreateAgentByAdminRequest request) {
        try {
            DeliveryAgent agent = deliveryService.createAgentByAdmin(
                request.name(),
                request.email(),
                request.phone(),
                request.vehicleType(),
                request.licenseNumber()
            );
            
            // Send delivery agent creation notification asynchronously
            notificationService.sendDeliveryAgentCreationNotification(
                agent.getEmail(),
                agent.getName(),
                "delivery123", // Default password for admin-created agents
                agent.getPhone(),
                agent.getVehicleType()
            );
            
            return ResponseEntity.ok(agent);
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest()
                    .body(new HashMap<String, String>() {{ put("error", ex.getMessage()); }});
        }
    }
    
    @GetMapping("/agents")
    public ResponseEntity<List<DeliveryAgent>> getAllAgents(@RequestParam(value = "email", required = false) String email) {
        if (email != null && !email.isEmpty()) {
            return deliveryService.getAgentByEmail(email)
                    .map(agent -> ResponseEntity.ok(List.of(agent)))
                    .orElse(ResponseEntity.notFound().build());
        }
        return ResponseEntity.ok(deliveryService.getAllAgents());
    }
    
    @GetMapping("/agents/available")
    public ResponseEntity<List<DeliveryAgent>> getAvailableAgents() {
        return ResponseEntity.ok(deliveryService.getAvailableAgents());
    }
    
    @GetMapping("/agents/pending")
    public ResponseEntity<List<DeliveryAgent>> getPendingAgents() {
        return ResponseEntity.ok(deliveryService.getPendingAgents());
    }
    
    @PutMapping("/agents/{agentId}/status")
    public ResponseEntity<?> updateAgentStatus(@PathVariable("agentId") Long agentId,
                                                         @RequestParam("status") DeliveryAgent.AgentStatus status) {
        try {
            DeliveryAgent agent = deliveryService.updateAgentStatus(agentId, status);
            return ResponseEntity.ok(agent);
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest()
                    .body(new HashMap<String, String>() {{ put("error", ex.getMessage()); }});
        }
    }
    
    @PutMapping("/agents/{agentId}/approve")
    public ResponseEntity<?> approveAgent(@PathVariable("agentId") Long agentId) {
        try {
            DeliveryAgent agent = deliveryService.approveAgent(agentId);
            
            // Send approval notification via direct endpoint
            try {
                restTemplate.postForObject(
                    "http://localhost:8089/notifications/delivery-agent-approval?email={email}&agentName={name}&loginPassword={password}",
                    null,
                    Object.class,
                    agent.getEmail(),
                    agent.getName(),
                    "delivery123"
                );
            } catch (Exception e) {
                System.err.println("Failed to send approval notification: " + e.getMessage());
            }
            
            return ResponseEntity.ok(agent);
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest()
                    .body(new HashMap<String, String>() {{ put("error", ex.getMessage()); }});
        }
    }
    
    @DeleteMapping("/agents/{agentId}")
    public ResponseEntity<?> deleteAgent(@PathVariable("agentId") Long agentId) {
        try {
            // Get agent details before deletion for notification
            Optional<DeliveryAgent> agentOpt = deliveryService.getAgentById(agentId);
            
            if (agentOpt.isPresent()) {
                DeliveryAgent agent = agentOpt.get();
                // Send deletion notification via direct endpoint
                try {
                    restTemplate.postForObject(
                        "http://localhost:8089/notifications/delivery-agent-deletion?email={email}&agentName={name}&reason={reason}",
                        null,
                        Object.class,
                        agent.getEmail(),
                        agent.getName(),
                        "Account deleted by admin"
                    );
                } catch (Exception e) {
                    System.err.println("Failed to send deletion notification: " + e.getMessage());
                }
            }
            
            deliveryService.deleteAgent(agentId);
            return ResponseEntity.ok().build();
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest()
                    .body(new HashMap<String, String>() {{ put("error", ex.getMessage()); }});
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new HashMap<String, String>() {{ put("error", ex.getMessage()); }});
        }
    }
    
    // DTOs
    public record CreateDeliveryRequest(
        @NotNull Long orderId,
        @NotNull Long restaurantId,
        @NotNull Long customerId,
        @NotBlank String pickupAddress,
        @NotBlank String deliveryAddress
    ) {}
    
    public record CreateAgentRequest(
        @NotBlank String name,
        @NotBlank String email,
        @NotBlank String password,
        @NotBlank String phone,
        @NotBlank String vehicleType,
        @NotBlank String licenseNumber
    ) {}
    
    public record CreateAgentByAdminRequest(
        @NotBlank String name,
        @NotBlank String email,
        @NotBlank String phone,
        @NotBlank String vehicleType,
        @NotBlank String licenseNumber
    ) {}
    
    public record UpdateDeliveryRequest(
        Long orderId,
        Long restaurantId,
        Long customerId,
        String pickupAddress,
        String deliveryAddress
    ) {}
}