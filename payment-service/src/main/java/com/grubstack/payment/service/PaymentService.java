package com.grubstack.payment.service;

import com.grubstack.payment.domain.Payment;
import com.grubstack.payment.repo.PaymentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.UUID;

@Service
public class PaymentService {
	private final PaymentRepository repo;

	public PaymentService(PaymentRepository repo) {
		this.repo = repo;
	}

	@Transactional
	public Payment createCashPayment(String orderId, int amountCents) {
		Payment p = new Payment();
		p.setOrderId(orderId);
		p.setAmountCents(amountCents);
		p.setMethod(Payment.PaymentMethod.CASH);
		p.setStatus(Payment.PaymentStatus.SUCCESS);
		p.setProviderRef("CASH-" + UUID.randomUUID());
		p.setCreatedAt(Instant.now());
		return repo.save(p);
	}

	@Transactional
	public Payment startUpiPayment(String orderId, int amountCents) {
		Payment p = new Payment();
		p.setOrderId(orderId);
		p.setAmountCents(amountCents);
		p.setMethod(Payment.PaymentMethod.UPI);
		p.setStatus(Payment.PaymentStatus.PENDING);
		p.setProviderRef("UPI-" + UUID.randomUUID());
		p.setCreatedAt(Instant.now());
		return repo.save(p);
	}

	@Transactional
	public Payment completeUpiPayment(String orderId, boolean success) {
		Payment p = repo.findByOrderId(orderId).orElseThrow();
		p.setStatus(success ? Payment.PaymentStatus.SUCCESS : Payment.PaymentStatus.FAILED);
		return repo.save(p);
	}
}


