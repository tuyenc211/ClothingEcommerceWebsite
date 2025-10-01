package com.project.ClothingEcommerceWebsite.controllers;

import com.project.ClothingEcommerceWebsite.dtos.request.CreateCategoryRequest;
import com.project.ClothingEcommerceWebsite.models.Category;
import com.project.ClothingEcommerceWebsite.services.CategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;

@RestController
@RequestMapping("${api.prefix}/categories")
@RequiredArgsConstructor
public class CategoryController {
    @Autowired
    private CategoryService categoryService;
    @PostMapping("")
    public ResponseEntity<?> createCategory(@Valid @RequestBody CreateCategoryRequest categoryRequest) {
        Category category = categoryService.createCategory(categoryRequest);
        return ResponseEntity.ok(category);
    }
    @GetMapping("/{id}")
    public ResponseEntity<?> getCategory(@PathVariable Long id) {
        return ResponseEntity.ok().body("");
    }
    @PutMapping("/{id}")
    public ResponseEntity<?> updateCategory() {
        return ResponseEntity.ok().body("");
    }
    @DeleteMapping("")
    public ResponseEntity<?> deleteCategory() {
        return ResponseEntity.ok().body("");
    }
}
