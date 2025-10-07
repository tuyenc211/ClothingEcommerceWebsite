package com.project.ClothingEcommerceWebsite.services.impl;

import com.project.ClothingEcommerceWebsite.dtos.request.CreateCategoryRequest;
import com.project.ClothingEcommerceWebsite.models.Category;
import com.project.ClothingEcommerceWebsite.repositories.CategoryRepository;
import com.project.ClothingEcommerceWebsite.services.CategoryService;
import com.project.ClothingEcommerceWebsite.utils.SlugUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;


@Service
public class CategoryServiceImpl implements CategoryService {
    @Autowired
    private CategoryRepository categoryRepository;

    @Override
    public Category createCategory(CreateCategoryRequest request) {
        Category parent = null;
        if (request.getParentId() != null) {
            parent = categoryRepository.findById(request.getParentId())
                    .orElseThrow(() -> new RuntimeException("Parent category not found"));
        }
        String slug = (request.getSlug() == null || request.getSlug().isBlank())
                ? SlugUtil.toSlug(request.getName())
                : SlugUtil.toSlug(request.getSlug());
        Category category = Category.builder()
                .parent(parent)
                .name(request.getName())
                .slug(slug)
                .isActive(request.getIsActive())
                .build();
        categoryRepository.save(category);
        return category;
    }
    @Override
    public Category getCategoryById(Long id) {
        return categoryRepository.findById(id).orElseThrow(() -> new RuntimeException("Category not found with id: " + id));
    }

    @Override
    public Page<Category> getAllCategories(Long parentId, Boolean isActive, String keyword, Pageable pageable) {
        return null;
    }

    @Override
    public Category updateCategory(Long id, CreateCategoryRequest request) {
        return null;
    }

    @Override
    public void deleteCategory(Long id) {

    }
}
