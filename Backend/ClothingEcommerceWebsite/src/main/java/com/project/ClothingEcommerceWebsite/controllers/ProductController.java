package com.project.ClothingEcommerceWebsite.controllers;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("${api.prefix}/products")
@RequiredArgsConstructor
public class ProductController {
    @PostMapping("")
    public ResponseEntity<?> createProduct() {
        return ResponseEntity.ok().body("");
    }
    @GetMapping("/{id}")
    public ResponseEntity<?> getProductById(@PathVariable Long id) {
        return ResponseEntity.ok().body("");
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
