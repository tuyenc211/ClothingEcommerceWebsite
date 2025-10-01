package com.project.ClothingEcommerceWebsite.services;

import com.project.ClothingEcommerceWebsite.dtos.request.CreateCategoryRequest;
import com.project.ClothingEcommerceWebsite.models.Category;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface CategoryService {
    Category createCategory(CreateCategoryRequest request);

    Category getCategoryById(Long id);

    Page<Category> getAllCategories(Long parentId, Boolean isActive, String keyword, Pageable pageable);

    Category updateCategory(Long id, CreateCategoryRequest request);

    void deleteCategory(Long id);
}
