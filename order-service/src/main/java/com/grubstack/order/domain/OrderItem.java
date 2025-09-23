package com.grubstack.order.domain;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;

@Entity
@Table(name = "order_items")
public class OrderItem {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(nullable = false)
	private Long menuItemId;

	@Column(nullable = false)
	private Integer quantity;

	@Column(nullable = false)
	private Integer priceCents;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "order_id")
	@JsonBackReference
	private OrderEntity order;

	public Long getId() { return id; }
	public void setId(Long id) { this.id = id; }
	public Long getMenuItemId() { return menuItemId; }
	public void setMenuItemId(Long menuItemId) { this.menuItemId = menuItemId; }
	public Integer getQuantity() { return quantity; }
	public void setQuantity(Integer quantity) { this.quantity = quantity; }
	public Integer getPriceCents() { return priceCents; }
	public void setPriceCents(Integer priceCents) { this.priceCents = priceCents; }
	public OrderEntity getOrder() { return order; }
	public void setOrder(OrderEntity order) { this.order = order; }
}