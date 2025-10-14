package com.project.ClothingEcommerceWebsite.services;

import com.project.ClothingEcommerceWebsite.dtos.request.CreateSizeRequest;
import com.project.ClothingEcommerceWebsite.models.Size;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface SizeService {
    Size createSize(CreateSizeRequest request);
    Size getSizeById(Long id);
    List<Size> getAllSizes();
    Size updateSize(Long id, CreateSizeRequest request);
    void deleteSize(Long id);
}
