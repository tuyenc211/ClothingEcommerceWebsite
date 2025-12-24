package com.project.ClothingEcommerceWebsite.services.impl;

import com.project.ClothingEcommerceWebsite.dtos.request.CreateProductVariantRequest;
import com.project.ClothingEcommerceWebsite.dtos.respond.*;
import com.project.ClothingEcommerceWebsite.exception.BadRequestException;
import com.project.ClothingEcommerceWebsite.exception.NotFoundException;
import com.project.ClothingEcommerceWebsite.models.*;
import com.project.ClothingEcommerceWebsite.repositories.*;
import com.project.ClothingEcommerceWebsite.services.ProductService;
import com.project.ClothingEcommerceWebsite.utils.CloudinaryUtil;
import com.project.ClothingEcommerceWebsite.utils.SlugUtil;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;
    private final ProductImageRepository productImageRepository;
    private final ReviewRepository reviewRepository;
    private final ColorRepository colorRepository;
    private final CartItemRepository cartItemRepository;
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
                .orElseThrow(() -> new NotFoundException("Category not found"));
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
    public List<ProductListResponse> getAllProduct(Pageable pageable) {
        Page<Product> pageProduct = productRepository.findAll(pageable);
        List<Product> products = pageProduct.getContent();

        List<Long> productIds = products.stream()
                .map(Product::getId)
                .collect(Collectors.toList());

        List<ProductImage> allImages = productImageRepository.findAllByProductIdIn(productIds);
        List<Inventory> allInventories = inventoryRepository.findAllByProductVariant_Product_IdIn(productIds);

        Map<Long, List<ProductImage>> imagesByProduct = allImages.stream()
                .collect(Collectors.groupingBy(img -> img.getProduct().getId()));

        Map<Long, Integer> totalStockByProduct = allInventories.stream()
                .collect(Collectors.groupingBy(
                        inv -> inv.getProductVariant().getProduct().getId(),
                        Collectors.summingInt(Inventory::getQuantity)
                ));

        return products.stream()
                .map(product -> {
                    Long productId = product.getId();

                    // Images
                    List<ProductImage> images = imagesByProduct.getOrDefault(productId, Collections.emptyList());
                    List<ProductImageResponse> imageDTOs = images.stream()
                            .map(img -> ProductImageResponse.builder()
                                    .id(img.getId())
                                    .image_url(img.getImageUrl())
                                    .position(img.getPosition())
                                    .build())
                            .collect(Collectors.toList());

                    Integer totalStock = totalStockByProduct.getOrDefault(productId, 0);

                    return ProductListResponse.builder()
                            .id(product.getId())
                            .sku(product.getSku())
                            .name(product.getName())
                            .slug(product.getSlug())
                            .description(product.getDescription())
                            .basePrice(product.getBasePrice())
                            .category(product.getCategory())
                            .isPublished(product.getIsPublished())
                            .images(imageDTOs)
                            .totalStock(totalStock)
                            .build();
                }).collect(Collectors.toList());
    }

    @Override
    public List<ProductDetailResponse> searchByName(String name) {
        List<Product> products = productRepository.findByNameContainingIgnoreCase(name);
        return products.stream()
                .filter(Product::getIsPublished)
                .map(p -> ProductDetailResponse.builder()
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
    public ProductDetailResponse getProductById(Long id) {
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

        return ProductDetailResponse.builder()
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

        Set<String> oldVariantKeys = new HashSet<>();
        for (ProductVariant variant : oldVariants) {
            String key = variant.getSize().getId() + "-" + variant.getColor().getId();
            oldVariantKeys.add(key);
        }

        List<Inventory> oldInventories = inventoryRepository.findAllByProductVariant_Product_Id(id);
        Map<String, Integer> oldInventoryMap = new HashMap<>();
        for (Inventory inv : oldInventories) {
            ProductVariant variant = inv.getProductVariant();
            String key = variant.getSize().getId() + "-" + variant.getColor().getId();
            oldInventoryMap.put(key, inv.getQuantity());
        }

        Set<String> newVariantKeys = new HashSet<>();
        for (Long sizeId : request.getSizeIds()) {
            for (Long colorId : request.getColorIds()) {
                String key = sizeId + "-" + colorId;
                newVariantKeys.add(key);
            }
        }

        boolean variantsChanged = !oldVariantKeys.equals(newVariantKeys);

        boolean priceChanged = !product.getBasePrice().equals(request.getBasePrice());

        if (variantsChanged) {
            Set<String> removedVariantKeys = new HashSet<>(oldVariantKeys);
            removedVariantKeys.removeAll(newVariantKeys);

            if (!removedVariantKeys.isEmpty()) {
                List<String> problematicVariants = new ArrayList<>();

                for (ProductVariant variant : oldVariants) {
                    String key = variant.getSize().getId() + "-" + variant.getColor().getId();
                    if (removedVariantKeys.contains(key)) {
                        if (orderItemRepository.existsByVariantId(variant.getId())) {
                            problematicVariants.add(
                                    "Size " + variant.getSize().getName() + " - Màu " + variant.getColor().getName()
                            );
                        }
                    }
                }

                if (!problematicVariants.isEmpty()) {
                    throw new BadRequestException(
                            "Không thể xóa các biến thể sau vì đã có đơn hàng: " +
                                    String.join(", ", problematicVariants)
                    );
                }
            }
        }

        boolean productInfoChanged = false;

        if (!product.getName().equals(request.getName())) {
            product.setName(request.getName());
            productInfoChanged = true;
        }

        if (!product.getDescription().equals(request.getDescription())) {
            product.setDescription(request.getDescription());
            productInfoChanged = true;
        }

        if (!product.getSku().equals(request.getSku())) {
            product.setSku(request.getSku());
            String newSlug = SlugUtil.toSlug(
                    request.getSlug() != null ? request.getSlug() : request.getName());
            product.setSlug(newSlug);
            productInfoChanged = true;
        }

        if (priceChanged) {
            product.setBasePrice(request.getBasePrice());
            productInfoChanged = true;
        }

        if (!product.getCategory().getId().equals(request.getCategoryId())) {
            Category category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new RuntimeException("Category not found"));
            product.setCategory(category);
            productInfoChanged = true;
        }

        if (!product.getIsPublished().equals(request.getIsPublished())) {
            product.setIsPublished(request.getIsPublished());
            productInfoChanged = true;
        }

        if (productInfoChanged) {
            productRepository.save(product);
        }

        List<String> keepImageUrls = request.getKeepImageUrls();
        if (keepImageUrls == null) {
            keepImageUrls = new ArrayList<>();
        }

        List<ProductImage> productImages = productImageRepository.findAllByProductId(product.getId());

        boolean hasImagesToDelete = false;
        for (ProductImage image : productImages) {
            if (!keepImageUrls.contains(image.getImageUrl())) {
                hasImagesToDelete = true;
                break;
            }
        }

        if (hasImagesToDelete) {
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
        }

        if (variantsChanged) {
            List<ProductVariant> variantsToDelete = productVariantRepository.findAllByProductId(product.getId());
            for (ProductVariant variant : variantsToDelete) {
                cartItemRepository.deleteAllByVariantId(variant.getId());
            }
            cartItemRepository.flush();
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

        } else if (priceChanged) {
            for (ProductVariant variant : oldVariants) {
                variant.setPrice(product.getBasePrice());
                productVariantRepository.save(variant);
            }
            updateCartItemsPricesForProduct(product.getId(), product.getBasePrice());
        }

        return product;
    }

    private void updateCartItemsPricesForProduct(Long productId, Double newPrice) {
        List<ProductVariant> variants = productVariantRepository.findAllByProductId(productId);
        for (ProductVariant variant : variants) {
            List<CartItem> cartItems = cartItemRepository.findByVariantId(variant.getId());

            if (!cartItems.isEmpty()) {
                for (CartItem item : cartItems) {
                    item.setUnitPrice(newPrice);
                    cartItemRepository.save(item);
                }
            }
        }
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
            try {
                cloudinaryService.deleteImage(CloudinaryUtil.extractPublicIdFromUrl(image.getImageUrl()));
            } catch (Exception e) {
                System.err.println("Warning: Could not delete image from Cloudinary: " + e.getMessage());
            }
        }
        productImageRepository.deleteAll(productImages);
        productRepository.delete(product);
    }

}
