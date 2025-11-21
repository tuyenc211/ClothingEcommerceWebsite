package com.project.ClothingEcommerceWebsite.services.impl;

import com.project.ClothingEcommerceWebsite.dtos.request.CreateProductVariantRequest;
import com.project.ClothingEcommerceWebsite.dtos.respond.ColorResponse;
import com.project.ClothingEcommerceWebsite.dtos.respond.ProductImageResponse;
import com.project.ClothingEcommerceWebsite.dtos.respond.ProductResponse;
import com.project.ClothingEcommerceWebsite.dtos.respond.SizeResponse;
import com.project.ClothingEcommerceWebsite.exception.BadRequestException;
import com.project.ClothingEcommerceWebsite.models.*;
import com.project.ClothingEcommerceWebsite.repositories.*;
import com.project.ClothingEcommerceWebsite.services.CategoryService;
import com.project.ClothingEcommerceWebsite.services.ProductService;
import com.project.ClothingEcommerceWebsite.utils.CloudinaryUtil;
import com.project.ClothingEcommerceWebsite.utils.SlugUtil;
import lombok.AllArgsConstructor;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import javax.transaction.Transactional;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;
    private final ProductImageRepository productImageRepository;
    private final ColorRepository colorRepository;
    private final CategoryRepository categoryRepository;
    private final SizeRepository sizeRepository;
    private final ProductVariantRepository productVariantRepository;
    private final InventoryRepository inventoryRepository;
    private final CloudinaryService cloudinaryService;

    @Override
    @Transactional
    public Product createProductWithVariants(CreateProductVariantRequest request) {
        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Category not found"));
        if (productRepository.existsBySku(request.getSku())) {
            throw new BadRequestException("SKU đã tồn tại. Vui lòng sử dụng SKU khác!!");
        }
        Product product = Product.builder()
                .sku(request.getSku())
                .name(request.getName())
                .slug(SlugUtil
                        .toSlug(
                        request.getSlug() != null ? request.getSlug() : request.getName()))
                .description(request.getDescription())
                .basePrice(request.getBasePrice())
                .category(category)
                .isPublished(request.getIsPublished() != null ? request.getIsPublished() : true)
                .build();
        productRepository.save(product);

        List<Size> sizes = sizeRepository.findAllById(request.getSizeIds());
        List<Color> colors = colorRepository.findAllById(request.getColorIds());
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
                productVariantRepository.save(variant);
                inventoryRepository.save(Inventory.builder()
                        .productVariant(variant)
                        .quantity(0)
                        .build());
            }
        }
        return product;
    }

    @Override
    public List<ProductResponse> getAllProduct() {
        List<Product> products = productRepository.findAll();
        return products.stream().map(product -> {
            List<Inventory> inventories = inventoryRepository.findAllByProductVariant_Product_Id(product.getId());
            List<ProductImage> images = productImageRepository.findAllByProductId(product.getId());
            List<ProductVariant> variants = productVariantRepository.findAllByProductId(product.getId());
            List<ProductImageResponse> imageDTOs = images.stream()
                    .map(image -> ProductImageResponse.builder()
                            .id(image.getId())
                            .image_url(image.getImageUrl())
                            .position(image.getPosition())
                            .build())
                    .collect(Collectors.toList());
            Set<SizeResponse> sizeDTOs = variants.stream()
                    .map(v -> v.getSize())
                    .filter(Objects::nonNull)
                    .map(size -> SizeResponse.builder()
                            .id(size.getId())
                            .name(size.getName())
                            .code(size.getCode())
                            .sortOrder(size.getSortOrder())
                            .build())
                    .collect(Collectors.toSet());
            Set<ColorResponse> colorDTOs = variants.stream()
                    .map(v -> v.getColor())
                    .filter(Objects::nonNull)
                    .map(color -> ColorResponse.builder()
                            .id(color.getId())
                            .name(color.getName())
                            .code(color.getCode())
                            .build())
                    .collect(Collectors.toSet());
            return ProductResponse.builder()
                    .id(product.getId())
                    .sku(product.getSku())
                    .name(product.getName())
                    .slug(product.getSlug())
                    .description(product.getDescription())
                    .basePrice(product.getBasePrice())
                    .category(product.getCategory())
                    .isPublished(product.getIsPublished())
                    .variants(variants)
                    .inventories(inventories)
                    .sizes(sizeDTOs)
                    .colors(colorDTOs)
                    .images(imageDTOs)
                    .build();
        }).collect(Collectors.toList());
    }

    @Override
    public List<ProductResponse> searchByName(String name) {
        List<Product> products = productRepository.findByNameContainingIgnoreCase(name);
        return products.stream()
                .map(p -> ProductResponse.builder()
                        .id(p.getId())
                        .sku(p.getSku())
                        .name(p.getName())
                        .slug(p.getSlug())
                        .images(p.getImages().stream()
                                .map(img -> ProductImageResponse.builder()
                                        .id(img.getId())
                                        .image_url(img.getImageUrl())
                                        .position(img.getPosition())
                                        .build())
                                .collect(Collectors.toList()))
                        .description(p.getDescription())
                        .basePrice(p.getBasePrice())
                        .category(p.getCategory())
                        .isPublished(p.getIsPublished())
                        .build())
                .collect(Collectors.toList());
    }

    @Override
    public ProductResponse getProductById(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found with id: " + id));
        List<Inventory> inventories = inventoryRepository.findAllByProductVariant_Product_Id(product.getId());
        List<ProductImage> images = productImageRepository.findAllByProductId(product.getId());
        List<ProductVariant> variants = productVariantRepository.findAllByProductId(product.getId());

        List<ProductImageResponse> imageDTOs = images.stream()
                .map(image -> ProductImageResponse.builder()
                        .id(image.getId())
                        .image_url(image.getImageUrl())
                        .position(image.getPosition())
                        .build())
                .collect(Collectors.toList());

        Set<SizeResponse> sizeDTOs = variants.stream()
                .map(v -> v.getSize())
                .filter(Objects::nonNull)
                .map(size -> SizeResponse.builder()
                        .id(size.getId())
                        .name(size.getName())
                        .code(size.getCode())
                        .sortOrder(size.getSortOrder())
                        .build())
                .collect(Collectors.toSet());

        Set<ColorResponse> colorDTOs = variants.stream()
                .map(v -> v.getColor())
                .filter(Objects::nonNull)
                .map(color -> ColorResponse.builder()
                        .id(color.getId())
                        .name(color.getName())
                        .code(color.getCode())
                        .build())
                .collect(Collectors.toSet());

        return ProductResponse.builder()
                .id(product.getId())
                .sku(product.getSku())
                .name(product.getName())
                .slug(product.getSlug())
                .description(product.getDescription())
                .basePrice(product.getBasePrice())
                .category(product.getCategory())
                .isPublished(product.getIsPublished())
                .variants(variants)
                .inventories(inventories)
                .sizes(sizeDTOs)
                .colors(colorDTOs)
                .images(imageDTOs)
                .build();

    }

    @Override
    @Transactional
    public Product updateProduct(Long id, CreateProductVariantRequest request) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found with id: " + id));
        if (productRepository.existsBySkuAndIdNot(request.getSku(), id)) {
            throw new BadRequestException("SKU đã tồn tại. Vui lòng sử dụng SKU khác!!");
        }
        product.setName(request.getName());
        product.setDescription(request.getDescription());
        product.setSku(request.getSku());
        product.setSlug(SlugUtil.toSlug(
                request.getSlug() != null ? request.getSlug() : request.getName()));
        product.setBasePrice(request.getBasePrice());
        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Category not found"));
        product.setCategory(category);
        product.setIsPublished(request.getIsPublished());
        productRepository.save(product);
        inventoryRepository.deleteAllByProductVariant_Product_Id(product.getId());
        inventoryRepository.flush();
        productVariantRepository.deleteAllByProductId(product.getId());
        productVariantRepository.flush();
        List<String> keepImageUrls = request.getKeepImageUrls();
        if (keepImageUrls == null) {
            keepImageUrls = new ArrayList<>();
        }

        List<ProductImage> productImages = productImageRepository.findAllByProductId(product.getId());
        for (ProductImage image : productImages) {
            if (!keepImageUrls.contains(image.getImageUrl())) {
                try {
                    cloudinaryService.deleteImage(CloudinaryUtil.extractPublicIdFromUrl(image.getImageUrl()));
                    productImageRepository.delete(image);
                } catch (Exception e) {
                    System.err.println("Warning: Could not delete image: " + e.getMessage());
                }
            }
        }
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
                productVariantRepository.save(variant);
                inventoryRepository.save(Inventory.builder()
                        .productVariant(variant)
                        .quantity(0)
                        .build());
            }
        }
        return product;
    }

    @Override
    @Transactional
    public void deleteProduct(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found with id: " + id));
        inventoryRepository.deleteAllByProductVariant_Product_Id(product.getId());
        productVariantRepository.deleteAllByProductId(product.getId());
        List<ProductImage> productImages = productImageRepository.findAllByProductId(product.getId());
        for (ProductImage image : productImages) {
            cloudinaryService.deleteImage(CloudinaryUtil.extractPublicIdFromUrl(image.getImageUrl()));
            productImageRepository.delete(image);
        }
        productRepository.delete(product);
    }

}
