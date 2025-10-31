package com.project.ClothingEcommerceWebsite.controllers;

import com.project.ClothingEcommerceWebsite.dtos.request.CreateOrderRequest;
import com.project.ClothingEcommerceWebsite.models.Order;
import com.project.ClothingEcommerceWebsite.services.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("${api.prefix}/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @PostMapping("/{userId}")
    public ResponseEntity<Order> createOrder(
            @PathVariable Long userId,
            @RequestBody CreateOrderRequest req) {
        return ResponseEntity.ok(orderService.createOrder(userId, req));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Order> getOrder(@PathVariable Long id) {
        return ResponseEntity.ok(orderService.getOrder(id));
    }

    @GetMapping("")
    public ResponseEntity<List<Order>> getOrder() {
        return ResponseEntity.ok(orderService.getAllOrder());
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Order>> getUserOrders(@PathVariable Long userId) {
        return ResponseEntity.ok(orderService.getOrdersByUser(userId));
    }

    @PatchMapping("/{userId}/{orderId}/cancel")
    public ResponseEntity<?> cancelOrder(
            @PathVariable Long userId,
            @PathVariable Long orderId) {
        orderService.cancelOrder(userId, orderId);
        return ResponseEntity.ok().body("");
    }

    @PatchMapping("/{orderId}/status")
    public ResponseEntity<Order> updateOrderStatus(
            @PathVariable Long orderId,
            @RequestParam("status") String status) {
        Order updatedOrder = orderService.updateOrderStatus(orderId, status);
        return ResponseEntity.ok(updatedOrder);
    }

}
