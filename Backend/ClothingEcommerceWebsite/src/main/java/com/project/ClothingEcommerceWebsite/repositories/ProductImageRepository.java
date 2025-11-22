package com.project.ClothingEcommerceWebsite.repositories;

import com.project.ClothingEcommerceWebsite.models.ProductImage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProductImageRepository extends JpaRepository<ProductImage, Long> {
    List<ProductImage> findAllByProductId(Long productId);
    void deleteAllByProductId(Long productId);
    List<ProductImage> findAllByProductIdIn(List<Long> productIds);
}
