package com.grubstack.restaurant.web;

import com.grubstack.restaurant.domain.MenuItem;
import com.grubstack.restaurant.domain.Restaurant;
import com.grubstack.restaurant.domain.Restaurant.RestaurantStatus;
import com.grubstack.restaurant.repo.MenuItemRepository;
import com.grubstack.restaurant.repo.RestaurantRepository;
import com.grubstack.restaurant.service.NotificationService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/restaurants")
@CrossOrigin(origins = {"http://localhost:8081", "http://localhost:3000", "http://localhost:5173"})
public class RestaurantController {
	private final RestaurantRepository restaurantRepo;
	private final MenuItemRepository menuRepo;
	private final NotificationService notificationService;

	public RestaurantController(RestaurantRepository restaurantRepo, MenuItemRepository menuRepo, NotificationService notificationService) {
		this.restaurantRepo = restaurantRepo;
		this.menuRepo = menuRepo;
		this.notificationService = notificationService;
	}

	@GetMapping
	public List<RestaurantSummaryDto> list() {
		return restaurantRepo.findAll().stream().map(RestaurantSummaryDto::fromEntity).collect(Collectors.toList());
	}

	@PostMapping
	public RestaurantDto create(@RequestBody @Valid CreateRestaurant req) {
		Restaurant r = new Restaurant();
		r.setName(req.name());
		r.setDescription(req.description());
		r.setCuisine(req.cuisine());
		r.setAddress(req.address());
		r.setPhone(req.phone());
		r.setEmail(req.email());
		r.setOwnerName(req.ownerName());
		r.setOwnerEmail(req.ownerEmail());
		r.setOwnerPhone(req.ownerPhone());
		r.setRating(req.rating() != null ? req.rating() : 0.0);
		r.setStatus(req.status() != null ? req.status() : RestaurantStatus.PENDING);
		r.setCreatedAt(Instant.now());
		r.setUpdatedAt(Instant.now());
		Restaurant saved = restaurantRepo.save(r);
		
		// Send restaurant registration notification asynchronously
		notificationService.sendRestaurantRegistrationNotification(
			saved.getId(),
			saved.getName(),
			saved.getOwnerName(),
			saved.getOwnerEmail(),
			saved.getEmail()
		);
		
		return RestaurantDto.fromEntity(saved);
	}

	@GetMapping("/{id}")
	public ResponseEntity<RestaurantDto> get(@PathVariable("id") Long id) {
		return restaurantRepo.findById(id)
				.map(RestaurantDto::fromEntity)
				.map(ResponseEntity::ok)
				.orElse(ResponseEntity.notFound().build());
	}


	@GetMapping("/{id}/menu")
	public List<MenuItemDto> listMenu(@PathVariable("id") Long id) {
		return menuRepo.findByRestaurantId(id).stream().map(MenuItemDto::fromEntity).collect(Collectors.toList());
	}

	@PostMapping("/{id}/menu")
	public ResponseEntity<MenuItemDto> addMenuItem(@PathVariable("id") Long id, @RequestBody @Valid CreateMenuItem req) {
		return restaurantRepo.findById(id).map(r -> {
			MenuItem m = new MenuItem();
			m.setName(req.name());
			m.setDescription(req.description());
			m.setPriceCents(req.priceCents());
			m.setRestaurant(r);
			return ResponseEntity.ok(MenuItemDto.fromEntity(menuRepo.save(m)));
		}).orElse(ResponseEntity.notFound().build());
	}

	@PutMapping("/menu/{menuItemId}")
	public ResponseEntity<MenuItemDto> updateMenuItem(@PathVariable("menuItemId") Long menuItemId, @RequestBody @Valid UpdateMenuItem req) {
		return menuRepo.findById(menuItemId).map(m -> {
			m.setName(req.name());
			m.setDescription(req.description());
			m.setPriceCents(req.priceCents());
			return ResponseEntity.ok(MenuItemDto.fromEntity(menuRepo.save(m)));
		}).orElse(ResponseEntity.notFound().build());
	}

	@DeleteMapping("/menu/{menuItemId}")
	public ResponseEntity<Void> deleteMenuItem(@PathVariable("menuItemId") Long menuItemId) {
		if (!menuRepo.existsById(menuItemId)) return ResponseEntity.notFound().build();
		menuRepo.deleteById(menuItemId);
		return ResponseEntity.noContent().build();
	}

	@GetMapping("/menu/{menuItemId}")
	public ResponseEntity<MenuItemDto> getMenuItem(@PathVariable("menuItemId") Long menuItemId) {
		return menuRepo.findById(menuItemId)
				.map(MenuItemDto::fromEntity)
				.map(ResponseEntity::ok)
				.orElse(ResponseEntity.notFound().build());
	}

	// Admin Management Endpoints
	@GetMapping("/admin/all")
	public List<RestaurantManagementDto> getAllRestaurantsForAdmin() {
		return restaurantRepo.findAll().stream()
				.map(RestaurantManagementDto::fromEntity)
				.collect(Collectors.toList());
	}

	@PatchMapping("/{id}/approve")
	@Transactional
	public ResponseEntity<RestaurantManagementDto> approveRestaurant(@PathVariable("id") Long id) {
		return restaurantRepo.findById(id)
				.map(restaurant -> {
					restaurant.setStatus(Restaurant.RestaurantStatus.APPROVED);
					restaurant.setUpdatedAt(Instant.now());
					Restaurant saved = restaurantRepo.save(restaurant);
					
					// Send restaurant approval notification asynchronously
					notificationService.sendRestaurantApprovalNotification(
						saved.getId(),
						saved.getName(),
						saved.getOwnerName(),
						saved.getOwnerEmail()
					);
					
					return ResponseEntity.ok(RestaurantManagementDto.fromEntity(saved));
				})
				.orElse(ResponseEntity.notFound().build());
	}

	@PatchMapping("/{id}/reject")
	@Transactional
	public ResponseEntity<RestaurantManagementDto> rejectRestaurant(@PathVariable("id") Long id) {
		return restaurantRepo.findById(id)
				.map(restaurant -> {
					restaurant.setStatus(Restaurant.RestaurantStatus.REJECTED);
					restaurant.setUpdatedAt(Instant.now());
					return ResponseEntity.ok(RestaurantManagementDto.fromEntity(restaurantRepo.save(restaurant)));
				})
				.orElse(ResponseEntity.notFound().build());
	}

	@PatchMapping("/{id}/status")
	public ResponseEntity<Restaurant> updateStatus(@PathVariable("id") Long id, @RequestBody UpdateStatusRequest request) {
		return restaurantRepo.findById(id)
			.map(restaurant -> {
				restaurant.setStatus(request.status());
				Restaurant saved = restaurantRepo.save(restaurant);
				return ResponseEntity.ok(saved);
			})
			.orElse(ResponseEntity.notFound().build());
	}

	@DeleteMapping("/{id}")
	@Transactional
	public ResponseEntity<Void> deleteRestaurant(@PathVariable("id") Long id) {
		if (!restaurantRepo.existsById(id)) {
			return ResponseEntity.notFound().build();
		}
		restaurantRepo.deleteById(id);
		return ResponseEntity.noContent().build();
	}

	// Delivery Status Management
	@PatchMapping("/{id}/delivery-status")
	public ResponseEntity<RestaurantDto> updateDeliveryStatus(@PathVariable("id") Long id, @RequestBody UpdateDeliveryStatusRequest request) {
		return restaurantRepo.findById(id)
			.map(restaurant -> {
				restaurant.setDeliveryStatus(request.deliveryStatus());
				restaurant.setUpdatedAt(Instant.now());
				Restaurant saved = restaurantRepo.save(restaurant);
				return ResponseEntity.ok(RestaurantDto.fromEntity(saved));
			})
			.orElse(ResponseEntity.notFound().build());
	}

	@GetMapping("/{id}/delivery-status")
	public ResponseEntity<DeliveryStatusDto> getDeliveryStatus(@PathVariable("id") Long id) {
		return restaurantRepo.findById(id)
			.map(restaurant -> ResponseEntity.ok(new DeliveryStatusDto(restaurant.getDeliveryStatus())))
			.orElse(ResponseEntity.notFound().build());
	}

	public record UpdateStatusRequest(RestaurantStatus status) {}
	public record UpdateDeliveryStatusRequest(Restaurant.DeliveryStatus deliveryStatus) {}
	public record DeliveryStatusDto(Restaurant.DeliveryStatus deliveryStatus) {}

	public record CreateRestaurant(
		@NotBlank String name, 
		String description, 
		String cuisine, 
		String address,
		String phone,
		String email,
		String ownerName,
		String ownerEmail,
		String ownerPhone,
		Double rating,
		RestaurantStatus status
	) {}
	public record CreateMenuItem(@NotBlank String name, String description, Integer priceCents) {}
	public record UpdateMenuItem(@NotBlank String name, String description, Integer priceCents) {}

	public record RestaurantSummaryDto(Long id, String name, String description, String cuisine, String address) {
		public static RestaurantSummaryDto fromEntity(Restaurant r) {
			return new RestaurantSummaryDto(r.getId(), r.getName(), r.getDescription(), r.getCuisine(), r.getAddress());
		}
	}

	public record RestaurantDto(
		Long id, 
		String name, 
		String description, 
		String cuisine, 
		String address,
		String phone,
		String email,
		String ownerName,
		String ownerEmail,
		String ownerPhone,
		Double rating,
		RestaurantStatus status,
		Restaurant.DeliveryStatus deliveryStatus,
		Instant createdAt,
		Instant updatedAt,
		List<MenuItemDto> menuItems
	) {
		public static RestaurantDto fromEntity(Restaurant r) {
			List<MenuItemDto> items = r.getMenuItems() == null ? List.of() : r.getMenuItems().stream().map(MenuItemDto::fromEntity).collect(Collectors.toList());
			return new RestaurantDto(
				r.getId(), 
				r.getName(), 
				r.getDescription(), 
				r.getCuisine(), 
				r.getAddress(),
				r.getPhone(),
				r.getEmail(),
				r.getOwnerName(),
				r.getOwnerEmail(),
				r.getOwnerPhone(),
				r.getRating(),
				r.getStatus(),
				r.getDeliveryStatus(),
				r.getCreatedAt(),
				r.getUpdatedAt(),
				items
			);
		}
	}

	public record MenuItemDto(Long id, String name, String description, Integer priceCents) {
		public static MenuItemDto fromEntity(MenuItem m) {
			return new MenuItemDto(m.getId(), m.getName(), m.getDescription(), m.getPriceCents());
		}
	}

	public record RestaurantManagementDto(
		Long id, 
		String name, 
		String description, 
		String cuisine, 
		String address,
		String phone,
		String email,
		String ownerName,
		String ownerEmail,
		String ownerPhone,
		Double rating,
		Restaurant.RestaurantStatus status,
		Instant createdAt,
		Instant updatedAt
	) {
		public static RestaurantManagementDto fromEntity(Restaurant r) {
			return new RestaurantManagementDto(
				r.getId(),
				r.getName(),
				r.getDescription(),
				r.getCuisine(),
				r.getAddress(),
				r.getPhone(),
				r.getEmail(),
				r.getOwnerName(),
				r.getOwnerEmail(),
				r.getOwnerPhone(),
				r.getRating(),
				r.getStatus(),
				r.getCreatedAt(),
				r.getUpdatedAt()
			);
		}
	}
}