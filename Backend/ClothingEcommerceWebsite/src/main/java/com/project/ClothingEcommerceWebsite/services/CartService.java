package com.project.ClothingEcommerceWebsite.services;

import com.project.ClothingEcommerceWebsite.models.Cart;
import com.project.ClothingEcommerceWebsite.models.CartItem;

import java.util.List;

public interface CartService {
    Cart getCartByUserId(Long userId);
    Cart addItemToCart(Long userId, Long variantId, Integer quantity);
    Cart updateItemQuantity(Long userId, Long variantId, Integer quantity);
    void removeItemFromCart(Long userId, Long variantId);
    void clearCart(Long userId);
    List<CartItem> getCartItems(Long userId);
}
