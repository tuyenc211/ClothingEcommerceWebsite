package com.project.ClothingEcommerceWebsite.repositories;

import com.project.ClothingEcommerceWebsite.models.Color;
import com.project.ClothingEcommerceWebsite.models.Size;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface SizeRepository extends JpaRepository<Size, Long> {
    Optional<Size> findByCode(String code);
    List<Size> findAllById(Long id);
    boolean existsByCode(String code);
    boolean existsByName(String name);
}
