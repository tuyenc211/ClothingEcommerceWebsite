package com.project.ClothingEcommerceWebsite.services.impl;

import com.project.ClothingEcommerceWebsite.dtos.respond.CartResponse;
import com.project.ClothingEcommerceWebsite.models.*;
import com.project.ClothingEcommerceWebsite.repositories.*;
import com.project.ClothingEcommerceWebsite.services.CartService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class CartServiceImpl implements CartService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductVariantRepository productVariantRepository;
    private final UserRepository userRepository;

    @Override
    public Cart getCartByUser(Long userId) {
        return cartRepository.findByUserId(userId)
                .orElseGet(() -> {
                    User user = userRepository.findById(userId)
                            .orElseThrow(() -> new RuntimeException("User not found"));
                    Cart cart = Cart.builder().user(user).build();
                    return cartRepository.save(cart);
                });
    }

    @Override
    public CartItem addItem(Long userId, Long variantId, int quantity) {
        Cart cart = getCartByUser(userId);
        ProductVariant variant = productVariantRepository.findById(variantId)
                .orElseThrow(() -> new RuntimeException("Product variant not found"));

        // Kiểm tra item đã tồn tại chưa
        List<CartItem> existingItems = cartItemRepository.findByCartId(cart.getId());
        for (CartItem item : existingItems) {
            if (item.getVariant().getId().equals(variantId)) {
                item.setQuantity(item.getQuantity() + quantity);
                return cartItemRepository.save(item);
            }
        }

        CartItem newItem = CartItem.builder()
                .cart(cart)
                .variant(variant)
                .quantity(quantity)
                .unitPrice(variant.getPrice() != null ? variant.getPrice() : Double.MIN_VALUE)
                .build();

        return cartItemRepository.save(newItem);
    }

    @Override
    public CartItem updateItem(Long userId, Long itemId, int quantity) {
        Cart cart = getCartByUser(userId);
        CartItem item = cartItemRepository.findById(itemId)
                .orElseThrow(() -> new RuntimeException("Cart item not found"));

        if (!item.getCart().getId().equals(cart.getId())) {
            throw new RuntimeException("Item does not belong to user's cart");
        }

        item.setQuantity(quantity);
        return cartItemRepository.save(item);
    }

    @Override
    public void removeItem(Long userId, Long itemId) {
        Cart cart = getCartByUser(userId);
        CartItem item = cartItemRepository.findById(itemId)
                .orElseThrow(() -> new RuntimeException("Cart item not found"));

        if (!item.getCart().getId().equals(cart.getId())) {
            throw new RuntimeException("Item does not belong to this user's cart");
        }

        cartItemRepository.delete(item);
    }

    @Override
    public void clearCart(Long userId) {
        Cart cart = getCartByUser(userId);
        cartItemRepository.deleteByCartId(cart.getId());
    }

    @Override
    public List<CartItem> getCartItems(Long userId) {
        Cart cart = getCartByUser(userId);
        return cartItemRepository.findByCartId(cart.getId());
    }
}
