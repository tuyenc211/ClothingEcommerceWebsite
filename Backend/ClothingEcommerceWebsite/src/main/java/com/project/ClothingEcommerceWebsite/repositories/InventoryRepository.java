package com.project.ClothingEcommerceWebsite.repositories;

import com.project.ClothingEcommerceWebsite.models.Inventory;
import com.project.ClothingEcommerceWebsite.models.ProductVariant;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface InventoryRepository extends JpaRepository<Inventory, Long> {
    Optional<Inventory> findByProductVariant(ProductVariant productVariant);
    List<Inventory> findAllByProductVariant_Product_Id(Long productId);
    void deleteAllByProductVariant_Product_Id(Long productId);
    List<Inventory> findAllByProductVariant_Product_IdIn(List<Long> productIds);
}
