package com.project.ClothingEcommerceWebsite.repositories;

import com.project.ClothingEcommerceWebsite.models.Color;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ColorRepository extends JpaRepository<Color, Long> {
    Optional<Color> findByCode(String code);
    List<Color> findAllById(Long id);
    boolean existsByCode(String code);
    boolean existsByName(String name);
}
