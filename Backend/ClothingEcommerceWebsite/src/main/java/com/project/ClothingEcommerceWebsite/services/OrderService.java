package com.project.ClothingEcommerceWebsite.services;

import com.project.ClothingEcommerceWebsite.dtos.request.CreateOrderRequest;
import com.project.ClothingEcommerceWebsite.models.Order;

import java.util.List;

public interface OrderService {
    Order createOrder(Long userId, CreateOrderRequest request);
    Order getOrder(Long id);
    List<Order> getAllOrder();
    List<Order> getOrdersByUser(Long userId);
    void cancelOrder(Long userId, Long orderId);
    Order updateOrderStatus(Long orderId, String status);
}
