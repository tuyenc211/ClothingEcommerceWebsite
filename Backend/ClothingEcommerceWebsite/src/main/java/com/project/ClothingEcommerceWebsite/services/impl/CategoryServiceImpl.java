package com.project.ClothingEcommerceWebsite.services.impl;

import com.project.ClothingEcommerceWebsite.dtos.request.CreateCategoryRequest;
import com.project.ClothingEcommerceWebsite.exception.BadRequestException;
import com.project.ClothingEcommerceWebsite.models.Category;
import com.project.ClothingEcommerceWebsite.repositories.CategoryRepository;
import com.project.ClothingEcommerceWebsite.services.CategoryService;
import com.project.ClothingEcommerceWebsite.utils.SlugUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;


@Service
public class CategoryServiceImpl implements CategoryService {
    @Autowired
    private CategoryRepository categoryRepository;

    @Override
    public Category createCategory(CreateCategoryRequest request) {
        if(categoryRepository.existsByName(request.getName())) {
            throw new BadRequestException("Tên danh mục đã tồn tại. Vui lòng sử dụng tên khác!!");
        }
        Category parent = null;
        if (request.getParentId() != null) {
            parent = categoryRepository.findById(request.getParentId())
                    .orElseThrow(() -> new RuntimeException("Parent category not found"));
        }
        String slug = (request.getSlug() == null || request.getSlug().isBlank())
                ? SlugUtil.toSlug(request.getName())
                : SlugUtil.toSlug(request.getSlug());
        Category category = Category.builder()
                .parentId(parent)
                .name(request.getName())
                .slug(slug)
                .isActive(true)
                .build();
        categoryRepository.save(category);
        return category;
    }
    @Override
    public Category getCategoryById(Long id) {
        return categoryRepository.findById(id).orElseThrow(() -> new RuntimeException("Category not found with id: " + id));
    }

    @Override
    public List<Category> getAllCategories() {
        return categoryRepository.findAll();
    }

    @Override
    public Category updateCategory(Long id, CreateCategoryRequest request) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Category not found with id: " + id));
        if(categoryRepository.existsByNameAndIdNot(request.getName(),id)) {
            throw new BadRequestException("Tên danh mục đã tồn tại. Vui lòng sử dụng tên khác!!");
        }
        if (request.getName() != null && !request.getName().isBlank()) {
            category.setName(request.getName());
            category.setSlug(SlugUtil.toSlug(request.getName()));
        }
        if (request.getSlug() != null && !request.getSlug().isBlank()) {
            category.setSlug(SlugUtil.toSlug(request.getSlug()));
        }
        if (request.getParentId() != null) {
            Category parent = categoryRepository.findById(request.getParentId())
                    .orElseThrow(() -> new RuntimeException("Parent category not found"));
            category.setParentId(parent);
        }
        if (request.getIsActive() != null) {
            category.setIsActive(request.getIsActive());
        }
        return categoryRepository.save(category);
    }

    @Override
    public void deleteCategory(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Category not found with id: " + id));
        boolean hasChildren = categoryRepository.existsByParentIdId(id);
        if (hasChildren) {
            throw new BadRequestException("Cannot delete category that has subcategories");
        }
        categoryRepository.delete(category);
    }
}
