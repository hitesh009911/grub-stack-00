package com.grubstack.user.config;

import com.grubstack.user.domain.UserAccount;
import com.grubstack.user.repo.UserAccountRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import java.time.Instant;
import java.util.List;
import java.util.Set;

@Configuration
public class SeedData {
	@Bean
	CommandLineRunner seedUsers(UserAccountRepository repo, BCryptPasswordEncoder encoder) {
		return args -> {
			if (repo.count() > 0) return;
			UserAccount admin = new UserAccount();
			admin.setEmail("admin@grub.local");
			admin.setPasswordHash(encoder.encode("admin123"));
			admin.setFullName("System Admin");
			admin.setRoles(Set.of("ADMIN"));
			admin.setCreatedAt(Instant.now());

			UserAccount owner = new UserAccount();
			owner.setEmail("owner@grub.local");
			owner.setPasswordHash(encoder.encode("owner123"));
			owner.setFullName("Restaurant Owner");
			owner.setRoles(Set.of("OWNER"));
			owner.setCreatedAt(Instant.now());

			UserAccount customer = new UserAccount();
			customer.setEmail("customer@grub.local");
			customer.setPasswordHash(encoder.encode("customer123"));
			customer.setFullName("John Customer");
			customer.setRoles(Set.of("CUSTOMER"));
			customer.setCreatedAt(Instant.now());

			UserAccount deliveryAgent = new UserAccount();
			deliveryAgent.setEmail("delivery@grub.local");
			deliveryAgent.setPasswordHash(encoder.encode("delivery123"));
			deliveryAgent.setFullName("Mike Delivery");
			deliveryAgent.setRoles(Set.of("DELIVERY"));
			deliveryAgent.setCreatedAt(Instant.now());

			repo.saveAll(List.of(admin, owner, customer, deliveryAgent));
		};
	}
}


