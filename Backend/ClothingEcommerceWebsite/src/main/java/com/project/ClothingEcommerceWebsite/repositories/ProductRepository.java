package com.project.ClothingEcommerceWebsite.repositories;

import com.project.ClothingEcommerceWebsite.models.Product;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.List;

public interface ProductRepository extends JpaRepository<Product, Long>, JpaSpecificationExecutor<Product> {
    boolean existsBySku(String sku);
    List<Product> findByNameContainingIgnoreCase(String name);
    boolean existsBySkuAndIdNot(String sku, Long id);
    boolean existsByName(String name);
    List<Product> findByCategoryId(Long categoryId);
    void deleteByCategoryId(Long categoryId);
}
