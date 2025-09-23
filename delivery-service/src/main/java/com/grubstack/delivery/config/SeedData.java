package com.grubstack.delivery.config;

import com.grubstack.delivery.domain.DeliveryAgent;
import com.grubstack.delivery.domain.Delivery;
import com.grubstack.delivery.domain.Delivery.DeliveryStatus;
import com.grubstack.delivery.repo.DeliveryAgentRepository;
import com.grubstack.delivery.repo.DeliveryRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.Instant;

@Component
public class SeedData implements CommandLineRunner {
    
    private final DeliveryAgentRepository agentRepo;
    private final DeliveryRepository deliveryRepo;
    private final BCryptPasswordEncoder passwordEncoder;
    
    public SeedData(DeliveryAgentRepository agentRepo, DeliveryRepository deliveryRepo) {
        this.agentRepo = agentRepo;
        this.deliveryRepo = deliveryRepo;
        this.passwordEncoder = new BCryptPasswordEncoder();
    }
    
    @Override
    public void run(String... args) throws Exception {
        if (agentRepo.count() == 0) {
            // Create sample delivery agents
            agentRepo.save(new DeliveryAgent(
                "John Smith", 
                "john.delivery@grubstack.com", 
                "+1-555-0101", 
                "Motorcycle", 
                "MC123456",
                passwordEncoder.encode("delivery123")
            ));
            
            agentRepo.save(new DeliveryAgent(
                "Sarah Johnson", 
                "sarah.delivery@grubstack.com", 
                "+1-555-0102", 
                "Bicycle", 
                "BC789012",
                passwordEncoder.encode("delivery123")
            ));
            
            agentRepo.save(new DeliveryAgent(
                "Mike Wilson", 
                "mike.delivery@grubstack.com", 
                "+1-555-0103", 
                "Car", 
                "CA345678",
                passwordEncoder.encode("delivery123")
            ));
            
            agentRepo.save(new DeliveryAgent(
                "Lisa Brown", 
                "lisa.delivery@grubstack.com", 
                "+1-555-0104", 
                "Motorcycle", 
                "MC901234",
                passwordEncoder.encode("delivery123")
            ));
            
            agentRepo.save(new DeliveryAgent(
                "David Lee", 
                "david.delivery@grubstack.com", 
                "+1-555-0105", 
                "Bicycle", 
                "BC567890",
                passwordEncoder.encode("delivery123")
            ));
            
            // Add the test agent from the frontend
            agentRepo.save(new DeliveryAgent(
                "Mike Delivery", 
                "delivery@grub.local", 
                "+1-555-9999", 
                "Motorcycle", 
                "MC999999",
                passwordEncoder.encode("delivery123")
            ));
            
            System.out.println("✅ Delivery agents seeded successfully!");
        }
        
        // Create sample deliveries if none exist
        if (deliveryRepo.count() == 0) {
            // Get some agents to assign deliveries to
            var agents = agentRepo.findAll();
            if (!agents.isEmpty()) {
                var agent1 = agents.get(0);
                var agent2 = agents.size() > 1 ? agents.get(1) : agent1;
                
                // Create sample deliveries
                deliveryRepo.save(new Delivery(
                    1001L, 1L, 1L, 
                    "123 Main St, Downtown", 
                    "456 Oak Ave, Uptown"
                ));
                
                deliveryRepo.save(new Delivery(
                    1002L, 2L, 2L, 
                    "789 Pine St, Midtown", 
                    "321 Elm St, Suburbs"
                ));
                
                deliveryRepo.save(new Delivery(
                    1003L, 1L, 3L, 
                    "555 Broadway, Downtown", 
                    "777 Park Ave, Uptown"
                ));
                
                // Assign some deliveries to agents
                var deliveries = deliveryRepo.findAll();
                if (deliveries.size() >= 2) {
                    var delivery1 = deliveries.get(0);
                    delivery1.setAgent(agent1);
                    delivery1.setStatus(DeliveryStatus.ASSIGNED);
                    delivery1.setAssignedAt(Instant.now());
                    deliveryRepo.save(delivery1);
                    
                    var delivery2 = deliveries.get(1);
                    delivery2.setAgent(agent2);
                    delivery2.setStatus(DeliveryStatus.PICKED_UP);
                    delivery2.setAssignedAt(Instant.now().minusSeconds(3600));
                    delivery2.setPickedUpAt(Instant.now().minusSeconds(1800));
                    deliveryRepo.save(delivery2);
                }
                
                System.out.println("✅ Sample deliveries seeded successfully!");
            }
        }
    }
}
