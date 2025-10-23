package com.project.ClothingEcommerceWebsite.services;

import org.springframework.web.multipart.MultipartFile;

import java.awt.*;
import java.util.List;

public interface ProductImageService {
    List<Image> uploadAndSaveImages(List<MultipartFile> files, Long productId);
}
