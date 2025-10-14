package com.project.ClothingEcommerceWebsite.services.impl;

import com.project.ClothingEcommerceWebsite.dtos.request.CreateSizeRequest;
import com.project.ClothingEcommerceWebsite.models.Size;
import com.project.ClothingEcommerceWebsite.repositories.SizeRepository;
import com.project.ClothingEcommerceWebsite.services.SizeService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SizeServiceImpl implements SizeService {

    private final SizeRepository sizeRepository;

    @Override
    public Size createSize(CreateSizeRequest request) {
        if (sizeRepository.existsByCode(request.getCode())) {
            throw new RuntimeException("Size code already exists");
        }
        if (sizeRepository.existsByName(request.getName())) {
            throw new RuntimeException("Size name already exists");
        }

        Size size = Size.builder()
                .code(request.getCode().trim().toUpperCase())
                .name(request.getName().trim())
                .sortOrder(request.getSortOrder() != null ? request.getSortOrder() : 0)
                .build();

        return sizeRepository.save(size);
    }

    @Override
    public Size getSizeById(Long id) {
        return sizeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Size not found with id: " + id));
    }

    @Override
    public List<Size> getAllSizes() {
        return sizeRepository.findAll();
    }

    @Override
    public Size updateSize(Long id, CreateSizeRequest request) {
        Size size = sizeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Size not found with id: " + id));

        size.setCode(request.getCode().trim().toUpperCase());
        size.setName(request.getName().trim());
        size.setSortOrder(request.getSortOrder() != null ? request.getSortOrder() : 0);
        return sizeRepository.save(size);
    }

    @Override
    public void deleteSize(Long id) {
        if (!sizeRepository.existsById(id)) {
            throw new RuntimeException("Size not found with id: " + id);
        }
        sizeRepository.deleteById(id);
    }
}
