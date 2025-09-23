package com.grubstack.delivery.domain;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.time.Instant;

@Entity
@Table(name = "delivery_agents")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class DeliveryAgent {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String name;
    
    @Column(nullable = false, unique = true)
    private String email;
    
    @Column(nullable = false)
    private String phone;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AgentStatus status = AgentStatus.ACTIVE;
    
    @Column(nullable = false)
    private String vehicleType;
    
    @Column(nullable = false)
    private String licenseNumber;
    
    @Column(nullable = false)
    private String passwordHash;
    
    @Column(nullable = false)
    private Instant createdAt;
    
    private Instant lastActiveAt;
    
    // Constructors
    public DeliveryAgent() {}
    
    public DeliveryAgent(String name, String email, String phone, String vehicleType, String licenseNumber, String passwordHash) {
        this.name = name;
        this.email = email;
        this.phone = phone;
        this.vehicleType = vehicleType;
        this.licenseNumber = licenseNumber;
        this.passwordHash = passwordHash;
        this.createdAt = Instant.now();
        this.lastActiveAt = Instant.now();
    }
    
    public DeliveryAgent(String name, String email, String phone, String vehicleType, String licenseNumber) {
        this.name = name;
        this.email = email;
        this.phone = phone;
        this.vehicleType = vehicleType;
        this.licenseNumber = licenseNumber;
        this.createdAt = Instant.now();
        this.lastActiveAt = Instant.now();
    }
    
    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    
    public AgentStatus getStatus() { return status; }
    public void setStatus(AgentStatus status) { this.status = status; }
    
    public String getVehicleType() { return vehicleType; }
    public void setVehicleType(String vehicleType) { this.vehicleType = vehicleType; }
    
    public String getLicenseNumber() { return licenseNumber; }
    public void setLicenseNumber(String licenseNumber) { this.licenseNumber = licenseNumber; }
    
    public String getPasswordHash() { return passwordHash; }
    public void setPasswordHash(String passwordHash) { this.passwordHash = passwordHash; }
    
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
    
    public Instant getLastActiveAt() { return lastActiveAt; }
    public void setLastActiveAt(Instant lastActiveAt) { this.lastActiveAt = lastActiveAt; }
    
    public enum AgentStatus {
        AVAILABLE, BUSY, OFFLINE, ACTIVE, INACTIVE
    }
}