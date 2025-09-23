package com.grubstack.restaurant.config;

import com.grubstack.restaurant.domain.MenuItem;
import com.grubstack.restaurant.domain.Restaurant;
import com.grubstack.restaurant.repo.MenuItemRepository;
import com.grubstack.restaurant.repo.RestaurantRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.Instant;
import java.util.List;

@Configuration
public class SeedData {
	@Bean
	CommandLineRunner seed(RestaurantRepository restaurants, MenuItemRepository menus) {
		return args -> {
			if (restaurants.count() > 0) return;
			
			// Restaurant 1 - Pending
			Restaurant r1 = new Restaurant();
			r1.setName("Sushi Place");
			r1.setCuisine("Japanese");
			r1.setDescription("Fresh sushi and rolls made with the finest ingredients");
			r1.setAddress("123 Ocean Ave, Mumbai, Maharashtra 400001");
			r1.setPhone("+91 98765 43210");
			r1.setEmail("info@sushiplace.com");
			r1.setOwnerName("Hiroshi Tanaka");
			r1.setOwnerEmail("hiroshi@sushiplace.com");
			r1.setOwnerPhone("+91 98765 43211");
			r1.setRating(4.5);
			r1.setStatus(Restaurant.RestaurantStatus.PENDING);
			r1.setCreatedAt(Instant.now());
			r1.setUpdatedAt(Instant.now());

			// Restaurant 2 - Approved
			Restaurant r2 = new Restaurant();
			r2.setName("Pasta Corner");
			r2.setCuisine("Italian");
			r2.setDescription("Authentic Italian pasta and pizza");
			r2.setAddress("456 Rome St, Mumbai, Maharashtra 400002");
			r2.setPhone("+91 98765 43220");
			r2.setEmail("info@pastacorner.com");
			r2.setOwnerName("Marco Rossi");
			r2.setOwnerEmail("marco@pastacorner.com");
			r2.setOwnerPhone("+91 98765 43221");
			r2.setRating(4.2);
			r2.setStatus(Restaurant.RestaurantStatus.APPROVED);
			r2.setCreatedAt(Instant.now());
			r2.setUpdatedAt(Instant.now());

			// Restaurant 3 - Rejected
			Restaurant r3 = new Restaurant();
			r3.setName("Burger Joint");
			r3.setCuisine("American");
			r3.setDescription("Gourmet burgers and fries");
			r3.setAddress("789 Main St, Mumbai, Maharashtra 400003");
			r3.setPhone("+91 98765 43230");
			r3.setEmail("info@burgerjoint.com");
			r3.setOwnerName("John Smith");
			r3.setOwnerEmail("john@burgerjoint.com");
			r3.setOwnerPhone("+91 98765 43231");
			r3.setRating(3.8);
			r3.setStatus(Restaurant.RestaurantStatus.REJECTED);
			r3.setCreatedAt(Instant.now());
			r3.setUpdatedAt(Instant.now());

			// Restaurant 4 - Active
			Restaurant r4 = new Restaurant();
			r4.setName("Spice Garden");
			r4.setCuisine("Indian");
			r4.setDescription("Traditional Indian cuisine with modern twist");
			r4.setAddress("321 Spice Lane, Mumbai, Maharashtra 400004");
			r4.setPhone("+91 98765 43240");
			r4.setEmail("info@spicegarden.com");
			r4.setOwnerName("Priya Sharma");
			r4.setOwnerEmail("priya@spicegarden.com");
			r4.setOwnerPhone("+91 98765 43241");
			r4.setRating(4.7);
			r4.setStatus(Restaurant.RestaurantStatus.ACTIVE);
			r4.setCreatedAt(Instant.now());
			r4.setUpdatedAt(Instant.now());

			r1 = restaurants.save(r1);
			r2 = restaurants.save(r2);
			r3 = restaurants.save(r3);
			r4 = restaurants.save(r4);

			menus.saveAll(List.of(
				createItem("California Roll", 799, r1),
				createItem("Salmon Nigiri", 899, r1),
				createItem("Spaghetti Carbonara", 1099, r2),
				createItem("Margherita Pizza", 999, r2),
				createItem("Classic Burger", 599, r3),
				createItem("Chicken Wings", 699, r3),
				createItem("Butter Chicken", 899, r4),
				createItem("Biryani", 799, r4)
			));
		};
	}

	private static MenuItem createItem(String name, int priceCents, Restaurant r) {
		MenuItem m = new MenuItem();
		m.setName(name);
		m.setPriceCents(priceCents);
		m.setRestaurant(r);
		return m;
	}
}


