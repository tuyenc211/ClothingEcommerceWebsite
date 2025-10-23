package com.project.ClothingEcommerceWebsite.services;

import com.project.ClothingEcommerceWebsite.models.ProductImage;
import org.springframework.web.multipart.MultipartFile;

import java.awt.*;
import java.util.List;

public interface ProductImageService {
    List<ProductImage> uploadAndSaveImages(List<MultipartFile> files, Long productId);
}
