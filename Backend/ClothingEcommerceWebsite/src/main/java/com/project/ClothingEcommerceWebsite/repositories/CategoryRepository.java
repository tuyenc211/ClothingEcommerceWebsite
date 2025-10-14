package com.project.ClothingEcommerceWebsite.repositories;

import com.project.ClothingEcommerceWebsite.models.Category;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CategoryRepository extends JpaRepository<Category, Long> {
    boolean existsByName(String name);
    boolean existsBySlug(String slug);
    Optional<Category> findBySlug(String slug);
    Page<Category> findByNameContainingIgnoreCase(String keyword, Pageable pageable);
    Page<Category> findByParentId(Long parentId, Pageable pageable);
    Page<Category> findByIsActive(Boolean isActive, Pageable pageable);
    boolean existsByParentIdId(Long parentId);
}
