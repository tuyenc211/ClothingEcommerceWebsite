package com.project.ClothingEcommerceWebsite.controllers;
import com.project.ClothingEcommerceWebsite.dtos.request.CreateProductVariantRequest;
import com.project.ClothingEcommerceWebsite.models.Category;
import com.project.ClothingEcommerceWebsite.models.Product;
import com.project.ClothingEcommerceWebsite.services.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("${api.prefix}/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;

    @PostMapping("")
    public ResponseEntity<?> createProduct(@RequestBody CreateProductVariantRequest request) {
        Product product = productService.createProductWithVariants(request);
        return ResponseEntity.ok(product);
    }
    @GetMapping("")
    public ResponseEntity<?> getAllProduct() {
        return ResponseEntity.ok(productService.getAllProduct());
    }
    @GetMapping("/{id}")
    public ResponseEntity<?> getProductById(@PathVariable Long id) {
        Product product = productService.getProductById(id);
        return ResponseEntity.ok(product);
    }
    @PutMapping("/{id}")
    public ResponseEntity<?> updateCategory() {
        return ResponseEntity.ok().body("");
    }
    @DeleteMapping("")
    public ResponseEntity<?> deleteProduct() {
        return ResponseEntity.ok().body("");
    }
}
