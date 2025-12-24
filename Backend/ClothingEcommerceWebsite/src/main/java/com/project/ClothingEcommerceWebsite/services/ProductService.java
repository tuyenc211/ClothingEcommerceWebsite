package com.project.ClothingEcommerceWebsite.services;

import com.project.ClothingEcommerceWebsite.dtos.request.CreateProductVariantRequest;
import com.project.ClothingEcommerceWebsite.dtos.respond.ProductDetailResponse;
import com.project.ClothingEcommerceWebsite.dtos.respond.ProductListResponse;
import com.project.ClothingEcommerceWebsite.models.Product;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface ProductService {
    Product createProductWithVariants(CreateProductVariantRequest request);
    List<ProductListResponse> getAllProduct(Pageable pageable);
    List<ProductDetailResponse> searchByName(String name);
    ProductDetailResponse getProductById(Long id);
    Product updateProduct(Long id, CreateProductVariantRequest request);
    void deleteProduct(Long id);
}
