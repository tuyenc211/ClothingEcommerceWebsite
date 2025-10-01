package com.project.ClothingEcommerceWebsite.repositories;

import com.project.ClothingEcommerceWebsite.models.Category;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CategoryRepository extends JpaRepository<Category, Long> {
    boolean existsByName(String name);
    boolean existsBySlug(String slug);
    Optional<Category> findBySlug(String slug);
    boolean existsByParent_Id(Long parentId);
}
