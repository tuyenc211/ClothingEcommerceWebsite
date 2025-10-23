package com.project.ClothingEcommerceWebsite.controllers;
import com.project.ClothingEcommerceWebsite.dtos.request.CreateProductVariantRequest;
import com.project.ClothingEcommerceWebsite.dtos.respond.ProductResponse;
import com.project.ClothingEcommerceWebsite.models.Category;
import com.project.ClothingEcommerceWebsite.models.Product;
import com.project.ClothingEcommerceWebsite.models.ProductImage;
import com.project.ClothingEcommerceWebsite.services.ProductImageService;
import com.project.ClothingEcommerceWebsite.services.ProductService;
import com.project.ClothingEcommerceWebsite.services.impl.CloudinaryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.awt.*;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("${api.prefix}/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;
    private final CloudinaryService cloudinaryService;
    private final ProductImageService productImageService;

    @PostMapping("")
    public ResponseEntity<?> createProduct(@RequestBody CreateProductVariantRequest request) {
        Product product = productService.createProductWithVariants(request);
        return ResponseEntity.ok(product);
    }
    @PostMapping("/{productId}/upload-image")
    public ResponseEntity<?> uploadImages(
            @PathVariable Long productId,
            @RequestParam("files") List<MultipartFile> files
    ) {
        if (files == null || files.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "No files provided"));
        }

        List<Image> savedImages = productImageService.uploadAndSaveImages(files, productId);

        List<String> urls = savedImages.stream()
                .map(Image::getUrl)
                .toList();

        return ResponseEntity.ok(Map.of(
                "message", "Images uploaded successfully",
                "urls", urls
        ));
    }
    @GetMapping("")
    public ResponseEntity<List<ProductResponse>> getAllProduct() {
        return ResponseEntity.ok(productService.getAllProduct());
    }
    @GetMapping("/{id}")
    public ResponseEntity<?> getProductById(@PathVariable Long id) {
        Product product = productService.getProductById(id);
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
