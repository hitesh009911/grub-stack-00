package com.grubstack.order.web;

import com.grubstack.order.domain.OrderEntity;
import com.grubstack.order.domain.OrderDTO;
import com.grubstack.order.domain.OrderItem;
import com.grubstack.order.domain.OrderItemDTO;
import com.grubstack.order.repo.OrderRepository;
import com.grubstack.order.service.DeliveryService;
import com.grubstack.order.service.NotificationService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/orders")
@CrossOrigin(origins = {"http://localhost:8081", "http://localhost:3000", "http://localhost:5173"})
public class OrderController {
	private final OrderRepository orderRepo;
	private final DeliveryService deliveryService;
	private final NotificationService notificationService;

	public OrderController(OrderRepository orderRepo, DeliveryService deliveryService, NotificationService notificationService) { 
		this.orderRepo = orderRepo;
		this.deliveryService = deliveryService;
		this.notificationService = notificationService;
	}

	private OrderDTO toOrderDTO(OrderEntity entity) {
		if (entity == null) return null;
		OrderDTO dto = new OrderDTO();
		dto.id = entity.getId();
		dto.restaurantId = entity.getRestaurantId();
		dto.userId = entity.getUserId();
		dto.totalCents = entity.getTotalCents();
		dto.status = entity.getStatus().name();
		dto.createdAt = entity.getCreatedAt();
		if (entity.getItems() != null) {
			dto.items = entity.getItems().stream().map(this::toOrderItemDTO).toList();
		}
		return dto;
	}

	private OrderItemDTO toOrderItemDTO(OrderItem item) {
		if (item == null) return null;
		OrderItemDTO dto = new OrderItemDTO();
		dto.id = item.getId();
		dto.menuItemId = item.getMenuItemId();
		dto.quantity = item.getQuantity();
		dto.priceCents = item.getPriceCents();
		return dto;
	}

	@GetMapping("/all")
	public List<OrderDTO> list() {
		return orderRepo.findAll().stream().map(this::toOrderDTO).toList();
	}

	@GetMapping("/restaurant/{restaurantId}")
	public List<OrderDTO> getByRestaurant(@PathVariable("restaurantId") Long restaurantId) {
		return orderRepo.findByRestaurantId(restaurantId).stream().map(this::toOrderDTO).toList();
	}

	@PostMapping("/{id}/status")
	public ResponseEntity<OrderDTO> updateStatus(@PathVariable("id") Long id, @RequestParam("status") String status) {
		try {
			OrderEntity.OrderStatus newStatus = OrderEntity.OrderStatus.valueOf(status.toUpperCase());
			return orderRepo.findById(id)
				.map(order -> {
					order.setStatus(newStatus);
					OrderEntity saved = orderRepo.save(order);
					
					// Send notifications based on status change
					if (newStatus == OrderEntity.OrderStatus.IN_TRANSIT) {
						notificationService.sendOrderPickedUpNotification(
							saved.getId(),
							saved.getUserId(),
							"hitumysuru@gmail.com", // Using test email
							"Delivery Agent" // TODO: Get real agent name
						);
					} else if (newStatus == OrderEntity.OrderStatus.DELIVERED) {
						notificationService.sendOrderDeliveredNotification(
							saved.getId(),
							saved.getUserId(),
							"hitumysuru@gmail.com", // Using test email
							"Delivery Agent" // TODO: Get real agent name
						);
					}
					
					return ResponseEntity.ok(toOrderDTO(saved));
				})
				.orElse(ResponseEntity.notFound().build());
		} catch (IllegalArgumentException e) {
			return ResponseEntity.badRequest().build();
		}
	}

	@PostMapping
	public ResponseEntity<OrderDTO> place(@RequestBody @Valid PlaceOrder req) {
		OrderEntity o = new OrderEntity();
		o.setRestaurantId(req.restaurantId());
		o.setUserId(req.userId());
		o.setStatus(OrderEntity.OrderStatus.PENDING);
		o.setCreatedAt(Instant.now());
		o.setItems(new ArrayList<>());
		int total = 0;
		for (PlaceOrderItem i : req.items()) {
			OrderItem oi = new OrderItem();
			oi.setMenuItemId(i.menuItemId());
			oi.setQuantity(i.quantity());
			oi.setPriceCents(i.priceCents());
			oi.setOrder(o);
			total += i.priceCents() * i.quantity();
			o.getItems().add(oi);
		}
		o.setTotalCents(total);
		OrderEntity saved = orderRepo.save(o);
		
		// Create delivery for the order asynchronously (don't block order creation)
		deliveryService.createDeliveryAsync(saved);
		
		// Send order placed notification asynchronously
		notificationService.sendOrderPlacedNotification(
			saved.getId(), 
			saved.getUserId(), 
			"hitumysuru@gmail.com", // Using test email
			"Restaurant " + saved.getRestaurantId(), // TODO: Get real restaurant name
			saved.getTotalCents()
		);
		
		return ResponseEntity.ok(toOrderDTO(saved));
	}

	@GetMapping("/{id}")
	public ResponseEntity<OrderDTO> get(@PathVariable("id") Long id) {
		return orderRepo.findById(id)
			.map(o -> ResponseEntity.ok(toOrderDTO(o)))
			.orElse(ResponseEntity.notFound().build());
	}


	@DeleteMapping("/{id}")
	public ResponseEntity<Object> cancel(@PathVariable("id") Long id) {
		return orderRepo.findById(id).map(o -> {
			o.setStatus(OrderEntity.OrderStatus.CANCELLED);
			orderRepo.save(o);
			return ResponseEntity.noContent().build();
		}).orElseGet(() -> ResponseEntity.notFound().build());
	}

	@PutMapping("/{id}/cancel")
	public ResponseEntity<?> cancelOrder(@PathVariable("id") Long id) {
		return orderRepo.findById(id).map(o -> {
			// Check if order can be cancelled (not in PREPARING, DELIVERED, or CANCELLED state)
			if (o.getStatus() == OrderEntity.OrderStatus.PREPARING || 
				o.getStatus() == OrderEntity.OrderStatus.DELIVERED || 
				o.getStatus() == OrderEntity.OrderStatus.CANCELLED) {
				return ResponseEntity.badRequest().build();
			}
			
			o.setStatus(OrderEntity.OrderStatus.CANCELLED);
			OrderEntity saved = orderRepo.save(o);
			
			// Send cancellation notification
			notificationService.sendOrderCancelledNotification(
				saved.getId(),
				saved.getUserId(),
				"hitumysuru@gmail.com", // Using test email
				"Restaurant " + saved.getRestaurantId() // TODO: Get real restaurant name
			);
			
			return ResponseEntity.ok(toOrderDTO(saved));
		}).orElseGet(() -> ResponseEntity.notFound().build());
	}


	public record PlaceOrder(@NotNull Long restaurantId, @NotNull Long userId, @NotNull List<PlaceOrderItem> items) {}
    public record PlaceOrderItem(@NotNull Long menuItemId, @NotNull Integer quantity, @NotNull Integer priceCents) {}
}