package com.grubstack.order.domain;

import java.time.Instant;
import java.util.List;

public class OrderDTO {
    public Long id;
    public Long restaurantId;
    public Long userId;
    public Integer totalCents;
    public String status;
    public Instant createdAt;
    public List<OrderItemDTO> items;
}