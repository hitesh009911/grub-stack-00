package com.grubstack.payment.domain;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "payments")
public class Payment {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(nullable = false)
	private String orderId;

	@Column(nullable = false)
	@Enumerated(EnumType.STRING)
	private PaymentMethod method;

	@Column(nullable = false)
	@Enumerated(EnumType.STRING)
	private PaymentStatus status;

	@Column(nullable = false)
	private Integer amountCents;

	private String providerRef;

	private Instant createdAt;

	public enum PaymentMethod { CASH, UPI }
	public enum PaymentStatus { PENDING, SUCCESS, FAILED }

	public Long getId() { return id; }
	public void setId(Long id) { this.id = id; }
	public String getOrderId() { return orderId; }
	public void setOrderId(String orderId) { this.orderId = orderId; }
	public PaymentMethod getMethod() { return method; }
	public void setMethod(PaymentMethod method) { this.method = method; }
	public PaymentStatus getStatus() { return status; }
	public void setStatus(PaymentStatus status) { this.status = status; }
	public Integer getAmountCents() { return amountCents; }
	public void setAmountCents(Integer amountCents) { this.amountCents = amountCents; }
	public String getProviderRef() { return providerRef; }
	public void setProviderRef(String providerRef) { this.providerRef = providerRef; }
	public Instant getCreatedAt() { return createdAt; }
	public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}


