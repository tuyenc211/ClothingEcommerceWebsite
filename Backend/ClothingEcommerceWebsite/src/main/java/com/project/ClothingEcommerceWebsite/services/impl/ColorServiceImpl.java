package com.project.ClothingEcommerceWebsite.services.impl;

import com.project.ClothingEcommerceWebsite.dtos.request.CreateColorRequest;
import com.project.ClothingEcommerceWebsite.exception.BadRequestException;
import com.project.ClothingEcommerceWebsite.models.Color;
import com.project.ClothingEcommerceWebsite.repositories.ColorRepository;
import com.project.ClothingEcommerceWebsite.repositories.ProductVariantRepository;
import com.project.ClothingEcommerceWebsite.services.ColorService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ColorServiceImpl implements ColorService {

    private final ColorRepository colorRepository;
    private final ProductVariantRepository productVariantRepository;

    @Override
    public Color createColor(CreateColorRequest request) {
        if (colorRepository.existsByCode(request.getCode())) {
            throw new RuntimeException("Color code already exists");
        }
        if (colorRepository.existsByName(request.getName())) {
            throw new RuntimeException("Color name already exists");
        }

        Color color = Color.builder()
                .code(request.getCode().trim().toUpperCase())
                .name(request.getName().trim())
                .build();

        return colorRepository.save(color);
    }

    @Override
    public Color getColorById(Long id) {
        return colorRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Color not found with id: " + id));
    }

    @Override
    public List<Color> getAllColors() {
        return colorRepository.findAll();
    }

    @Override
    public Color updateColor(Long id, CreateColorRequest request) {
        Color color = colorRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Color not found with id: " + id));
        color.setCode(request.getCode().trim().toUpperCase());
        color.setName(request.getName().trim());
        return colorRepository.save(color);
    }

    @Override
    public void deleteColor(Long id) {
        if (!colorRepository.existsById(id)) {
            throw new RuntimeException("Color not found with id: " + id);
        }
        if (productVariantRepository.existsByColorId(id)) {
            throw new BadRequestException(
                    "Không thể xóa màu sắc đã được sử dụng trong sản phẩm!!"
            );
        }
        colorRepository.deleteById(id);
    }
}
