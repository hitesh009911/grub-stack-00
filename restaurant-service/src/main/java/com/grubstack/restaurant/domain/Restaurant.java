package com.grubstack.restaurant.domain;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.List;
import com.fasterxml.jackson.annotation.JsonManagedReference;

@Entity
@Table(name = "restaurants")
public class Restaurant {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(nullable = false)
	private String name;

	private String description;

	private String cuisine;

	private String address;

	private String phone;

	private String email;

	private String ownerName;

	private String ownerEmail;

	private String ownerPhone;

	private Double rating = 0.0;

	@Enumerated(EnumType.STRING)
	private RestaurantStatus status = RestaurantStatus.PENDING;

	@Enumerated(EnumType.STRING)
	private DeliveryStatus deliveryStatus = DeliveryStatus.OFFLINE;

	private Instant createdAt;

	private Instant updatedAt;

	@OneToMany(mappedBy = "restaurant", cascade = CascadeType.ALL, orphanRemoval = true)
	@JsonManagedReference
	private List<MenuItem> menuItems;

	public enum RestaurantStatus {
		PENDING, APPROVED, REJECTED, ACTIVE, INACTIVE
	}

	public enum DeliveryStatus {
		ONLINE, OFFLINE
	}

	public Long getId() { return id; }
	public void setId(Long id) { this.id = id; }

	public String getName() { return name; }
	public void setName(String name) { this.name = name; }

	public String getDescription() { return description; }
	public void setDescription(String description) { this.description = description; }

	public String getCuisine() { return cuisine; }
	public void setCuisine(String cuisine) { this.cuisine = cuisine; }

	public String getAddress() { return address; }
	public void setAddress(String address) { this.address = address; }

	public Instant getCreatedAt() { return createdAt; }
	public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

	public String getPhone() { return phone; }
	public void setPhone(String phone) { this.phone = phone; }

	public String getEmail() { return email; }
	public void setEmail(String email) { this.email = email; }

	public String getOwnerName() { return ownerName; }
	public void setOwnerName(String ownerName) { this.ownerName = ownerName; }

	public String getOwnerEmail() { return ownerEmail; }
	public void setOwnerEmail(String ownerEmail) { this.ownerEmail = ownerEmail; }

	public String getOwnerPhone() { return ownerPhone; }
	public void setOwnerPhone(String ownerPhone) { this.ownerPhone = ownerPhone; }

	public Double getRating() { return rating; }
	public void setRating(Double rating) { this.rating = rating; }

	public RestaurantStatus getStatus() { return status; }
	public void setStatus(RestaurantStatus status) { this.status = status; }

	public DeliveryStatus getDeliveryStatus() { return deliveryStatus; }
	public void setDeliveryStatus(DeliveryStatus deliveryStatus) { this.deliveryStatus = deliveryStatus; }

	public Instant getUpdatedAt() { return updatedAt; }
	public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }

	public List<MenuItem> getMenuItems() { return menuItems; }
	public void setMenuItems(List<MenuItem> menuItems) { this.menuItems = menuItems; }
}


