package com.project.ClothingEcommerceWebsite.services.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.project.ClothingEcommerceWebsite.dtos.request.CreateOrderRequest;
import com.project.ClothingEcommerceWebsite.exception.NotFoundException;
import com.project.ClothingEcommerceWebsite.models.*;
import com.project.ClothingEcommerceWebsite.repositories.*;
import com.project.ClothingEcommerceWebsite.services.OrderService;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@AllArgsConstructor
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final InventoryRepository inventoryRepository;
    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final UserRepository userRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public Order createOrder(Long userId, CreateOrderRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Cart cart = cartRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Cart not found"));

        List<CartItem> cartItems = cartItemRepository.findByCartId(cart.getId());
        if (cartItems.isEmpty()) {
            throw new RuntimeException("Cart is empty");
        }
        double subtotal = cartItems.stream()
                .mapToDouble(i -> i.getUnitPrice() * i.getQuantity())
                .sum();
        double shippingFee = 30000.0;
        double grandTotal = subtotal + shippingFee;
        Enums.PaymentStatus paymentStatus;
        if(request.getPaymentMethod().equals("COD")) {
            paymentStatus = Enums.PaymentStatus.PAID;
        } else {
            paymentStatus = Enums.PaymentStatus.UNPAID;
        }
        // Tạo đơn hàng
        Order order = Order.builder()
                .user(user)
                .code("ORD-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase())
                .status(Enums.OrderStatus.NEW)
                .paymentMethod(request.getPaymentMethod())
                .paymentStatus(paymentStatus)
                .subtotal(subtotal)
                .discountTotal(0.0)
                .shippingFee(shippingFee)
                .grandTotal(grandTotal)
                .totalItems(cartItems.size())
                .shippingAddressSnapshot(toJson(request.getShippingAddress()))
                .placedAt(LocalDateTime.now())
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        orderRepository.save(order);

        // Tạo order_items
        List<OrderItem> orderItems = cartItems.stream().map(i -> {
            ProductVariant variant = i.getVariant();
            Inventory inventory = inventoryRepository.findByProductVariant(variant)
                    .orElseThrow(() -> new NotFoundException("Inventory not found!!"));
            if (inventory.getQuantity() < i.getQuantity()) {
                throw new RuntimeException("Sản phẩm " + variant.getProduct().getName() + " không đủ hàng.");
            }
            inventory.setQuantity(inventory.getQuantity() - i.getQuantity());
            inventoryRepository.save(inventory);
            return OrderItem.builder()
                    .order(order)
                    .product(variant.getProduct())
                    .variant(variant)
                    .productName(variant.getProduct().getName())
                    .sku(variant.getSku())
                    .unitPrice(i.getUnitPrice())
                    .quantity(i.getQuantity())
                    .lineTotal(i.getUnitPrice() * i.getQuantity())
                    .build();
        }).collect(Collectors.toList());
        orderItemRepository.saveAll(orderItems);
        // Xóa giỏ hàng sau khi đặt
        cartItemRepository.deleteAll(cartItems);

        return order;
    }

    private String toJson(Object obj) {
        try {
            return objectMapper.writeValueAsString(obj);
        } catch (Exception e) {
            throw new RuntimeException("JSON serialization error", e);
        }
    }

    @Override
    public Order getOrder(Long id) {
        return orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found"));
    }

    @Override
    public List<Order> getAllOrder() {
        return orderRepository.findAll();
    }

    @Override
    public List<Order> getOrdersByUser(Long userId) {
        return orderRepository.findByUserId(userId);
    }

    @Override
    public void cancelOrder(Long userId, Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        if (!order.getUser().getId().equals(userId)) {
            throw new RuntimeException("Order does not belong to this user");
        }
        if (order.getStatus() != Enums.OrderStatus.NEW) {
            throw new RuntimeException("Cannot cancel order that is already " + order.getStatus());
        }
        order.setStatus(Enums.OrderStatus.CANCELLED);
        order.setCancelledAt(LocalDateTime.now());
        order.setUpdatedAt(LocalDateTime.now());
        orderRepository.save(order);
        List<OrderItem> orderItems = orderItemRepository.findByOrderId(orderId);
        for (OrderItem item : orderItems) {
            ProductVariant variant = item.getVariant();
            Inventory inventory = inventoryRepository.findByProductVariant(variant)
                    .orElseThrow(() -> new NotFoundException("Inventory not found!!"));
            inventory.setQuantity(inventory.getQuantity() + item.getQuantity());
            inventoryRepository.save(inventory);
        }
    }

    @Override
    public Order updateOrderStatus(Long orderId, String status) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        Enums.OrderStatus currentStatus = order.getStatus();
        Enums.OrderStatus newStatus;
        try {
            newStatus = Enums.OrderStatus.valueOf(status.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Invalid order status: " + status);
        }
        if (!isValidTransition(currentStatus, newStatus)) {
            throw new RuntimeException("Invalid transition: cannot change from " + currentStatus + " to " + newStatus);
        }
        order.setStatus(newStatus);
        order.setUpdatedAt(LocalDateTime.now());

        switch (newStatus) {
            case CONFIRMED -> order.setPlacedAt(LocalDateTime.now());
            case SHIPPED, DELIVERED -> order.setPaidAt(LocalDateTime.now());
            case CANCELLED -> {
                order.setCancelledAt(LocalDateTime.now());
                List<OrderItem> orderItems = orderItemRepository.findByOrderId(orderId);
                for (OrderItem item : orderItems) {
                    ProductVariant variant = item.getVariant();
                    Inventory inventory = inventoryRepository.findByProductVariant(variant)
                            .orElseThrow(() -> new NotFoundException("Inventory not found!!"));
                    inventory.setQuantity(inventory.getQuantity() + item.getQuantity());
                    inventoryRepository.save(inventory);
                }
            }
        }
        return orderRepository.save(order);
    }

    @Override
    public Order updatePaymentStatus(Long orderId, String status) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        Enums.PaymentStatus newStatus = Enums.PaymentStatus.valueOf(status.toUpperCase());
        order.setPaymentStatus(newStatus);
        order.setPaidAt(LocalDateTime.now());
        orderRepository.save(order);
        return order;
    }

    private boolean isValidTransition(Enums.OrderStatus current, Enums.OrderStatus next) {
        return switch (current) {
            case NEW -> next == Enums.OrderStatus.CONFIRMED || next == Enums.OrderStatus.CANCELLED;
            case CONFIRMED -> next == Enums.OrderStatus.PACKING;
            case PACKING -> next == Enums.OrderStatus.SHIPPED;
            case SHIPPED -> next == Enums.OrderStatus.DELIVERED;
            case DELIVERED, CANCELLED -> false;
        };
    }

}
