package com.grubstack.restaurant.repo;

import com.grubstack.restaurant.domain.MenuItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface MenuItemRepository extends JpaRepository<MenuItem, Long> {
	@Query("select m from MenuItem m where m.restaurant.id = :restaurantId")
	List<MenuItem> findByRestaurantId(@Param("restaurantId") Long restaurantId);
}


