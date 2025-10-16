package com.project.ClothingEcommerceWebsite.services;

import com.project.ClothingEcommerceWebsite.dtos.request.CreateProductVariantRequest;
import com.project.ClothingEcommerceWebsite.models.Product;

import java.util.List;

public interface ProductService {
    Product createProductWithVariants(CreateProductVariantRequest request);
    List<Product> getAllProduct();
}
