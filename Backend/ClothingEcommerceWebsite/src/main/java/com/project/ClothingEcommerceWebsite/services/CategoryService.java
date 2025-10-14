package com.project.ClothingEcommerceWebsite.services;

import com.project.ClothingEcommerceWebsite.dtos.request.CreateCategoryRequest;
import com.project.ClothingEcommerceWebsite.models.Category;
import java.util.List;

public interface CategoryService {
    Category createCategory(CreateCategoryRequest request);

    Category getCategoryById(Long id);

    List<Category> getAllCategories();

    Category updateCategory(Long id, CreateCategoryRequest request);

    void deleteCategory(Long id);
}
