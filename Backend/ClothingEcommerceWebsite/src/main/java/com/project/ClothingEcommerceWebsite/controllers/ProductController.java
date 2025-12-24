package com.project.ClothingEcommerceWebsite.controllers;
import com.project.ClothingEcommerceWebsite.dtos.request.CreateProductVariantRequest;
import com.project.ClothingEcommerceWebsite.dtos.respond.ProductDetailResponse;
import com.project.ClothingEcommerceWebsite.dtos.respond.ProductListResponse;
import com.project.ClothingEcommerceWebsite.models.Product;
import com.project.ClothingEcommerceWebsite.models.ProductImage;
import com.project.ClothingEcommerceWebsite.services.ProductImageService;
import com.project.ClothingEcommerceWebsite.services.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("${api.prefix}/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;
    private final ProductImageService productImageService;

    @PostMapping("")
    public ResponseEntity<?> createProduct(@RequestBody CreateProductVariantRequest request) {
        Product product = productService.createProductWithVariants(request);
        ProductDetailResponse productResponse = ProductDetailResponse.builder()
                .id(product.getId())
                .name(product.getName())
                .sku(product.getSku())
                .isPublished(product.getIsPublished())
                .slug(product.getSlug())
                .description(product.getDescription())
                .basePrice(product.getBasePrice())
                .category(null)
                .sizes(null)
                .colors(null)
                .build();
        return ResponseEntity.ok(productResponse);
    }
    @PostMapping("/{productId}/upload-image")
    public ResponseEntity<?> uploadImages(
            @PathVariable Long productId,
            @RequestParam("files") List<MultipartFile> files
    ) {
        if (files == null || files.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "No files provided"));
        }

        List<ProductImage> savedImages = productImageService.uploadAndSaveImages(files, productId);

        List<String> urls = savedImages.stream()
                .map(ProductImage::getImageUrl)
                .toList();

        return ResponseEntity.ok(Map.of(
                "message", "Images uploaded successfully",
                "urls", urls
        ));
    }

    @GetMapping("/search")
    public ResponseEntity<List<ProductDetailResponse>> searchByName(
            @RequestParam String name) {
        return ResponseEntity.ok(productService.searchByName(name));
    }

    @GetMapping("")
    public ResponseEntity<List<ProductListResponse>> getAllProduct(
            @RequestParam("current") Optional<String> currentOptional,
            @RequestParam("pageSize") Optional<String> pageSizeOptional
    ) {
        String sCurrent = currentOptional.isPresent() ? currentOptional.get() : "";
        String sPageSize = pageSizeOptional.isPresent() ? pageSizeOptional.get() : "";
        int current = Integer.parseInt(sCurrent);
        int pageSize = Integer.parseInt(sPageSize);
        Pageable pageable = PageRequest.of(current - 1, pageSize);
        return ResponseEntity.ok(productService.getAllProduct(pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getProductById(@PathVariable Long id) {
        ProductDetailResponse product = productService.getProductById(id);
        return ResponseEntity.ok(product);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateProduct(@PathVariable Long id, @RequestBody CreateProductVariantRequest request) {
        Product product = productService.updateProduct(id, request);
        return ResponseEntity.ok(product);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteProduct(@PathVariable Long id) {
        productService.deleteProduct(id);
        return ResponseEntity.ok().body("");
    }
}
