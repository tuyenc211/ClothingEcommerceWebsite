package com.project.ClothingEcommerceWebsite.controllers;

import com.project.ClothingEcommerceWebsite.models.Cart;
import com.project.ClothingEcommerceWebsite.models.CartItem;
import com.project.ClothingEcommerceWebsite.services.CartService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("${api.prefix}/carts")
@RequiredArgsConstructor
public class CartController {

    private final CartService cartService;

    @GetMapping("/{userId}")
    public ResponseEntity<List<CartItem>> getCartItems(@PathVariable Long userId) {
        return ResponseEntity.ok(cartService.getCartItems(userId));
    }

    @PostMapping("/{userId}/add")
    public ResponseEntity<CartItem> addItem(
            @PathVariable Long userId,
            @RequestParam Long variantId,
            @RequestParam int quantity) {
        return ResponseEntity.ok(cartService.addItem(userId, variantId, quantity));
    }

    @PutMapping("/{userId}/update")
    public ResponseEntity<CartItem> updateItem(
            @PathVariable Long userId,
            @RequestParam Long itemId,
            @RequestParam int quantity) {
        return ResponseEntity.ok(cartService.updateItem(userId, itemId, quantity));
    }

    @DeleteMapping("/{userId}/remove/{itemId}")
    public ResponseEntity<Void> removeItem(@PathVariable Long userId, @PathVariable Long itemId) {
        cartService.removeItem(userId, itemId);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{userId}/clear")
    public ResponseEntity<Void> clearCart(@PathVariable Long userId) {
        cartService.clearCart(userId);
        return ResponseEntity.noContent().build();
    }
}
