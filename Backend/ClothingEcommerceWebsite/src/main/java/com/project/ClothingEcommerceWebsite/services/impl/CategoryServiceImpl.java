package com.project.ClothingEcommerceWebsite.services.impl;

import com.project.ClothingEcommerceWebsite.dtos.request.CreateCategoryRequest;
import com.project.ClothingEcommerceWebsite.exception.BadRequestException;
import com.project.ClothingEcommerceWebsite.models.Category;
import com.project.ClothingEcommerceWebsite.models.Product;
import com.project.ClothingEcommerceWebsite.repositories.CategoryRepository;
import com.project.ClothingEcommerceWebsite.repositories.ProductRepository;
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

    @Autowired
    private ProductRepository productRepository;

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
            boolean newStatus = request.getIsActive();
            boolean oldStatus = category.getIsActive();

            if (newStatus != oldStatus) {
                category.setIsActive(newStatus);
                boolean isParent = (category.getParentId() == null);

                if (isParent) {
                    List<Category> children = categoryRepository.findByParentIdId(id);
                    if (!children.isEmpty()) {
                        children.forEach(child -> child.setIsActive(newStatus));
                        categoryRepository.saveAll(children);

                        for (Category child : children) {
                            List<Product> products = productRepository.findByCategoryId(child.getId());
                            if (!products.isEmpty()) {
                                products.forEach(p -> p.setIsPublished(newStatus));
                                productRepository.saveAll(products);
                            }
                        }
                    }

                    List<Product> parentProducts = productRepository.findByCategoryId(id);
                    if (!parentProducts.isEmpty()) {
                        parentProducts.forEach(p -> p.setIsPublished(newStatus));
                        productRepository.saveAll(parentProducts);
                    }
                } else {
                    List<Product> products = productRepository.findByCategoryId(id);
                    if (!products.isEmpty()) {
                        products.forEach(p -> p.setIsPublished(newStatus));
                        productRepository.saveAll(products);
                    }
                }
            }
        }
        return categoryRepository.save(category);
    }

    @Override
    public void deleteCategory(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Category not found with id: " + id));
        List<Category> children = categoryRepository.findByParentIdId(id);
        if (!children.isEmpty()) {
            throw new BadRequestException(
                    "Không thể xóa danh mục có " + children.size() + " danh mục con. " +
                            "Vui lòng xóa hoặc chuyển danh mục con trước!"
            );
        }
        List<Product> products = productRepository.findByCategoryId(id);
        if (!products.isEmpty()) {
            throw new BadRequestException(
                    "Không thể xóa danh mục có " + products.size() + " sản phẩm. " +
                            "Vui lòng xóa hoặc chuyển sản phẩm sang danh mục khác!"
            );
        }
        categoryRepository.delete(category);
    }
}
