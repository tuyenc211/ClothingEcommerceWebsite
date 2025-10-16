package com.project.ClothingEcommerceWebsite.services;

import com.project.ClothingEcommerceWebsite.dtos.request.CreateCategoryRequest;
import com.project.ClothingEcommerceWebsite.dtos.request.CreateProductVariantRequest;
import com.project.ClothingEcommerceWebsite.models.Category;
import com.project.ClothingEcommerceWebsite.models.Product;

import java.util.List;
import java.util.Optional;

public interface ProductService {
    Product createProductWithVariants(CreateProductVariantRequest request);
    List<Product> getAllProduct();
    Product getProductById(Long id);
    Product updateProduct(Long id, CreateProductVariantRequest request);
    void deleteProduct(Long id);
}
