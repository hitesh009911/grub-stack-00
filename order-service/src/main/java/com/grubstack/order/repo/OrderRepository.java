package com.grubstack.order.repo;

import com.grubstack.order.domain.OrderEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface OrderRepository extends JpaRepository<OrderEntity, Long> {
    List<OrderEntity> findByRestaurantId(Long restaurantId);
}


