package com.project.ClothingEcommerceWebsite.services.impl;

import com.project.ClothingEcommerceWebsite.dtos.request.CreateProductVariantRequest;
import com.project.ClothingEcommerceWebsite.models.*;
import com.project.ClothingEcommerceWebsite.repositories.*;
import com.project.ClothingEcommerceWebsite.services.CategoryService;
import com.project.ClothingEcommerceWebsite.services.ProductService;
import com.project.ClothingEcommerceWebsite.utils.SlugUtil;
import lombok.AllArgsConstructor;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import javax.transaction.Transactional;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;
    private final ColorRepository colorRepository;
    private final CategoryRepository categoryRepository;
    private final SizeRepository sizeRepository;
    private final ProductVariantRepository productVariantRepository;

    @Override
    @Transactional
    public Product createProductWithVariants(CreateProductVariantRequest request) {
        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Category not found"));

        if (productRepository.existsBySku(request.getSku())) {
            throw new RuntimeException("SKU already exists");
        }
        Product product = Product.builder()
                .sku(request.getSku())
                .name(request.getName())
                .slug(SlugUtil.toSlug(
                        request.getSlug() != null ? request.getSlug() : request.getName()))
                .description(request.getDescription())
                .basePrice(request.getBasePrice())
                .category(category)
                .isPublished(request.getIsPublished() != null ? request.getIsPublished() : true)
                .build();
        productRepository.save(product);

        List<Size> sizes = sizeRepository.findAllById(request.getSizeIds());
        List<Color> colors = colorRepository.findAllById(request.getColorIds());
        List<ProductVariant> variants = new ArrayList<>();
        for (Size size : sizes) {
            for (Color color : colors) {
                String variantSku = product.getSku() + "-" + color.getCode() + "-" + size.getCode();
                ProductVariant variant = ProductVariant.builder()
                        .product(product)
                        .sku(variantSku)
                        .size(size)
                        .color(color)
                        .price(product.getBasePrice())
                        .build();
                variants.add(variant);
            }
        }
        productVariantRepository.saveAll(variants);
        return product;
    }

    @Override
    public List<Product> getAllProduct() {
        return productRepository.findAll();
    }

    @Override
    public Product getProductById(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found with id: " + id));
    }

    @Override
    public Product updateProduct(Long id, CreateProductVariantRequest request) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found with id: " + id));
        product.setName(request.getName());
        product.setDescription(request.getDescription());
        product.setSlug(SlugUtil.toSlug(
                request.getSlug() != null ? request.getSlug() : request.getName()));
        product.setBasePrice(request.getBasePrice());
        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Category not found"));
        product.setCategory(category);
        product.setIsPublished(request.getIsPublished());
        productRepository.save(product);

        List<Size> sizes = sizeRepository.findAllById(request.getSizeIds());
        List<Color> colors = colorRepository.findAllById(request.getColorIds());
        List<ProductVariant> variants = new ArrayList<>();
        for (Size size : sizes) {
            for (Color color : colors) {
                String variantSku = product.getSku() + "-" + color.getCode() + "-" + size.getCode();
                ProductVariant variant = ProductVariant.builder()
                        .product(product)
                        .sku(variantSku)
                        .size(size)
                        .color(color)
                        .price(product.getBasePrice())
                        .build();
                variants.add(variant);
            }
        }
        productVariantRepository.saveAll(variants);
        return product;
    }

    @Override
    public void deleteProduct(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found with id: " + id));
        productVariantRepository.deleteAllByProductId(product.getId());
        productRepository.delete(product);
    }

}
