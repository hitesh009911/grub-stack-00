package com.grubstack.payment.web;

import com.grubstack.payment.domain.Payment;
import com.grubstack.payment.repo.PaymentRepository;
import com.grubstack.payment.service.PaymentService;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/payments")
@CrossOrigin(origins = {"http://localhost:8081", "http://localhost:3000", "http://localhost:5173"})
public class PaymentController {
	private final PaymentService paymentService;
	private final PaymentRepository paymentRepo;

	public PaymentController(PaymentService paymentService, PaymentRepository paymentRepo) { 
		this.paymentService = paymentService; 
		this.paymentRepo = paymentRepo;
	}

	@PostMapping("/cash")
	public ResponseEntity<Payment> cash(@RequestParam("orderId") @NotBlank String orderId, @RequestParam("amountCents") @Positive int amountCents) {
		return ResponseEntity.ok(paymentService.createCashPayment(orderId, amountCents));
	}

	@PostMapping("/upi/start")
	public ResponseEntity<Payment> upiStart(@RequestParam("orderId") @NotBlank String orderId, @RequestParam("amountCents") @Positive int amountCents) {
		return ResponseEntity.ok(paymentService.startUpiPayment(orderId, amountCents));
	}

	@PostMapping("/upi/callback")
	public ResponseEntity<Payment> upiCallback(@RequestParam("orderId") @NotBlank String orderId, @RequestParam("success") boolean success) {
		return ResponseEntity.ok(paymentService.completeUpiPayment(orderId, success));
	}

	@GetMapping
	public ResponseEntity<Iterable<Payment>> getAllPayments() {
		return ResponseEntity.ok(paymentRepo.findAll());
	}

	@GetMapping("/{orderId}")
	public ResponseEntity<Payment> getPayment(@PathVariable("orderId") @NotBlank String orderId) {
		return paymentRepo.findByOrderId(orderId)
				.map(ResponseEntity::ok)
				.orElse(ResponseEntity.notFound().build());
	}
}


