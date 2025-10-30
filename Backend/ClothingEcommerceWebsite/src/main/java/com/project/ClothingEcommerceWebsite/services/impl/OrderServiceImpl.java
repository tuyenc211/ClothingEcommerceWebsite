package com.project.ClothingEcommerceWebsite.services.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.project.ClothingEcommerceWebsite.dtos.request.CreateOrderRequest;
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

        // Tạo đơn hàng
        Order order = Order.builder()
                .user(user)
                .code("ORD-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase())
                .status(Enums.OrderStatus.NEW)
                .paymentMethod(request.getPaymentMethod())
                .paymentStatus(Enums.PaymentStatus.UNPAID)
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
        List<OrderItem> orderItems = cartItems.stream()
                .map(i -> OrderItem.builder()
                        .order(order)
                        .product(i.getVariant().getProduct())
                        .variant(i.getVariant())
                        .productName(i.getVariant().getProduct().getName())
                        .sku(i.getVariant().getSku())
                        .unitPrice(i.getUnitPrice())
                        .quantity(i.getQuantity())
                        .lineTotal(i.getUnitPrice() * i.getQuantity())
                        .build())
                .collect(Collectors.toList());

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

        order.setStatus(Enums.OrderStatus.CANCELLED);
        order.setCancelledAt(LocalDateTime.now());
        orderRepository.save(order);
    }
}
