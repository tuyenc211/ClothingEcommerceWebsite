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
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;
    private final ProductImageRepository productImageRepository;
    private final ColorRepository colorRepository;
    private final CategoryRepository categoryRepository;
    private final SizeRepository sizeRepository;
    private final OrderItemRepository orderItemRepository;
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
                .isPublished(request.getIsPublished())
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
    public List<ProductResponse> getAllProductIsPublished() {
        List<Product> products = productRepository.findAll();
        return products
                .stream()
                .filter(Product::getIsPublished)
                .map(product -> {
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
                .filter(Product::getIsPublished)
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
        List<ProductVariant> oldVariants = productVariantRepository.findAllByProductId(id);
        // Tạo Set các cặp (sizeId, colorId) từ variants cũ
        Set<String> oldVariantKeys = new HashSet<>();
        for (ProductVariant variant : oldVariants) {
            String key = variant.getSize().getId() + "-" + variant.getColor().getId();
            oldVariantKeys.add(key);
        }

        // Tạo Set các cặp (sizeId, colorId) từ request mới
        Set<String> newVariantKeys = new HashSet<>();
        for (Long sizeId : request.getSizeIds()) {
            for (Long colorId : request.getColorIds()) {
                String key = sizeId + "-" + colorId;
                newVariantKeys.add(key);
            }
        }

        boolean variantsChanged = !oldVariantKeys.equals(newVariantKeys);

        // Nếu variants THAY ĐỔI → Check orders
        if (variantsChanged) {
            // Tìm variants nào sẽ bị XÓA (có trong cũ, không có trong mới)
            Set<String> removedVariantKeys = new HashSet<>(oldVariantKeys);
            removedVariantKeys.removeAll(newVariantKeys);

            if (!removedVariantKeys.isEmpty()) {
                // Check xem variants bị xóa có trong orders không
                for (ProductVariant variant : oldVariants) {
                    String key = variant.getSize().getId() + "-" + variant.getColor().getId();
                    if (removedVariantKeys.contains(key)) {
                        if (orderItemRepository.existsByVariantId(variant.getId())) {
                            throw new BadRequestException(
                                    "Không thể xóa biến thể Size " + variant.getSize().getName() +
                                            ", Màu " + variant.getColor().getName() +
                                            " vì đã có đơn hàng!!"
                            );
                        }
                    }
                }
            }
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
        if (variantsChanged) {
            Map<String, Integer> oldInventoryMap = new HashMap<>();
            for (ProductVariant oldVariant : oldVariants) {
                String key = oldVariant.getSize().getId() + "-" + oldVariant.getColor().getId();
                List<Inventory> inventories = inventoryRepository.findAllByProductVariant_Product_Id(id);
                for (Inventory inv : inventories) {
                    if (inv.getProductVariant().getId().equals(oldVariant.getId())) {
                        oldInventoryMap.put(key, inv.getQuantity());
                        break;
                    }
                }
            }

            inventoryRepository.deleteAllByProductVariant_Product_Id(product.getId());
            inventoryRepository.flush();
            productVariantRepository.deleteAllByProductId(product.getId());
            productVariantRepository.flush();

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

                    String key = size.getId() + "-" + color.getId();
                    Integer oldQuantity = oldInventoryMap.get(key);
                    int quantity = (oldQuantity != null) ? oldQuantity : 0;

                    inventoryRepository.save(Inventory.builder()
                            .productVariant(variant)
                            .quantity(quantity)
                            .build());
                }
            }
        } else {
            for (ProductVariant variant : oldVariants) {
                variant.setPrice(product.getBasePrice());
                productVariantRepository.save(variant);
            }
        }
        return product;
    }

    @Override
    @Transactional
    public void deleteProduct(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found with id: " + id));
        if(orderItemRepository.existsByProductId(id)) {
            throw new BadRequestException("Không thể xóa sản phẩm đã có đơn hàng!!");
        }
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
