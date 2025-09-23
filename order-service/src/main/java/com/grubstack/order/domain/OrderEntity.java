package com.grubstack.order.domain;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import java.time.Instant;
import java.util.List;

@Entity
@Table(name = "orders")
public class OrderEntity {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(nullable = false)
	private Long restaurantId;

	@Column(nullable = false)
	private Long userId;

	@Column(nullable = false)
	private Integer totalCents;

	@Column(nullable = false)
	@Enumerated(EnumType.STRING)
	private OrderStatus status;

	private Instant createdAt;

	@OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
	@JsonManagedReference
	private List<OrderItem> items;

	public enum OrderStatus { PENDING, PREPARING, READY, PICKED_UP, IN_TRANSIT, DELIVERED, CANCELLED }

	public Long getId() { return id; }
	public void setId(Long id) { this.id = id; }
	public Long getRestaurantId() { return restaurantId; }
	public void setRestaurantId(Long restaurantId) { this.restaurantId = restaurantId; }
	public Long getUserId() { return userId; }
	public void setUserId(Long userId) { this.userId = userId; }
	public Integer getTotalCents() { return totalCents; }
	public void setTotalCents(Integer totalCents) { this.totalCents = totalCents; }
	public OrderStatus getStatus() { return status; }
	public void setStatus(OrderStatus status) { this.status = status; }
	public Instant getCreatedAt() { return createdAt; }
	public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
	public List<OrderItem> getItems() { return items; }
	public void setItems(List<OrderItem> items) { this.items = items; }
}