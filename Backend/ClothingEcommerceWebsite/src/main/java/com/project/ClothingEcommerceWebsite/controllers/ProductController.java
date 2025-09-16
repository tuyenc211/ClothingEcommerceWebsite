package com.project.ClothingEcommerceWebsite.controllers;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("${api.prefix}/products")
@RequiredArgsConstructor
public class ProductController {
    @PostMapping("")
    public ResponseEntity<?> createProduct() {
        return ResponseEntity.ok().body("");
    }
}
