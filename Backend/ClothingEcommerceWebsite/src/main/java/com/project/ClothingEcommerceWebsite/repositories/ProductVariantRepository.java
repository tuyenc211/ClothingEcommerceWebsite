package com.project.ClothingEcommerceWebsite.repositories;

import com.project.ClothingEcommerceWebsite.models.ProductVariant;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProductVariantRepository extends JpaRepository<ProductVariant, Long> {
    void deleteAllByProductId(Long id);
}
