package com.project.ClothingEcommerceWebsite.repositories;

import com.project.ClothingEcommerceWebsite.models.CartItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CartItemRepository extends JpaRepository<CartItem, Long> {
    List<CartItem> findByCartId(Long cartId);
    void deleteByCartId(Long cartId);
    void deleteAllByVariantId(Long variantId);
    List<CartItem> findByVariantId(Long variantId);
}
