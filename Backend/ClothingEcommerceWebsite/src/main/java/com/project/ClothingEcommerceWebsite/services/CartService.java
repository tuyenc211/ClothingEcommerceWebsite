package com.project.ClothingEcommerceWebsite.services;

import com.project.ClothingEcommerceWebsite.models.Cart;
import com.project.ClothingEcommerceWebsite.models.CartItem;

import java.util.List;

public interface CartService {
    Cart getCartByUser(Long userId);
    CartItem addItem(Long userId, Long variantId, int quantity);
    CartItem updateItem(Long userId, Long itemId, int quantity);
    void removeItem(Long userId, Long itemId);
    void clearCart(Long userId);
    List<CartItem> getCartItems(Long userId);
}
