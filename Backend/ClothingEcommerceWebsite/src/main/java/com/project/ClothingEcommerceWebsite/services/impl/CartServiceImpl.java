package com.project.ClothingEcommerceWebsite.services.impl;

import com.project.ClothingEcommerceWebsite.models.Cart;
import com.project.ClothingEcommerceWebsite.models.CartItem;
import com.project.ClothingEcommerceWebsite.models.ProductVariant;
import com.project.ClothingEcommerceWebsite.models.User;
import com.project.ClothingEcommerceWebsite.repositories.CartItemRepository;
import com.project.ClothingEcommerceWebsite.repositories.CartRepository;
import com.project.ClothingEcommerceWebsite.repositories.ProductVariantRepository;
import com.project.ClothingEcommerceWebsite.repositories.UserRepository;
import com.project.ClothingEcommerceWebsite.services.CartService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import javax.transaction.Transactional;
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
    public Cart getCartByUserId(Long userId) {
        return cartRepository.findByUserId(userId)
                .orElseGet(() -> {
                    User user = userRepository.findById(userId)
                            .orElseThrow(() -> new RuntimeException("User not found"));
                    Cart newCart = Cart.builder().user(user).build();
                    return cartRepository.save(newCart);
                });
    }

    @Override
    public Cart addItemToCart(Long userId, Long variantId, Integer quantity) {
        Cart cart = getCartByUserId(userId);
        ProductVariant variant = productVariantRepository.findById(variantId)
                .orElseThrow(() -> new RuntimeException("Variant not found"));

        // Nếu item đã có, chỉ tăng số lượng
        for (CartItem item : cart.getCartItems()) {
            if (item.getVariant().getId().equals(variantId)) {
                item.setQuantity(item.getQuantity() + quantity);
                return cartRepository.save(cart);
            }
        }

        // Nếu chưa có item, thêm mới
        CartItem cartItem = CartItem.builder()
                .cart(cart)
                .variant(variant)
                .unitPrice(variant.getPrice() != null ? variant.getPrice() : Double.MIN_VALUE)
                .quantity(quantity)
                .build();

        cart.getCartItems().add(cartItem);
        return cartRepository.save(cart);
    }

    @Override
    public Cart updateItemQuantity(Long userId, Long variantId, Integer quantity) {
        Cart cart = getCartByUserId(userId);
        cart.getCartItems().forEach(item -> {
            if (item.getVariant().getId().equals(variantId)) {
                item.setQuantity(quantity);
            }
        });
        return cartRepository.save(cart);
    }

    @Override
    public void removeItemFromCart(Long userId, Long variantId) {
        Cart cart = getCartByUserId(userId);
        cart.getCartItems().removeIf(item -> item.getVariant().getId().equals(variantId));
        cartRepository.save(cart);
    }

    @Override
    public void clearCart(Long userId) {
        Cart cart = getCartByUserId(userId);
        cart.getCartItems().clear();
        cartRepository.save(cart);
    }

    @Override
    public List<CartItem> getCartItems(Long userId) {
        Cart cart = getCartByUserId(userId);
        return cartItemRepository.findByCartId(cart.getId());
    }
}
