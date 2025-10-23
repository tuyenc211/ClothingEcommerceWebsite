package com.project.ClothingEcommerceWebsite.services.impl;

import com.project.ClothingEcommerceWebsite.models.Product;
import com.project.ClothingEcommerceWebsite.models.ProductImage;
import com.project.ClothingEcommerceWebsite.repositories.ProductImageRepository;
import com.project.ClothingEcommerceWebsite.repositories.ProductRepository;
import com.project.ClothingEcommerceWebsite.services.ProductImageService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.awt.*;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductImageServiceImpl implements ProductImageService {
    private final ProductImageRepository imageRepository;
    private final CloudinaryService cloudinaryService;
    private final ProductRepository productRepository;

    @Override
    public List<ProductImage> uploadAndSaveImages(List<MultipartFile> files, Long productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));
        List<ProductImage> existingImages = imageRepository.findAllByProductId(productId);
        int maxPosition = existingImages.stream()
                .mapToInt(ProductImage::getPosition)
                .max()
                .orElse(0);
        List<ProductImage> savedImages = new ArrayList<>();
        int currentPosition = maxPosition;
        for (MultipartFile file : files) {
            currentPosition++;
            String imageUrl = cloudinaryService.uploadImage(file);
            ProductImage productImage = ProductImage.builder()
                    .imageUrl(imageUrl)
                    .product(product)
                    .position(currentPosition)
                    .build();
            savedImages.add(imageRepository.save(productImage));
        }
        return savedImages;
    }
}
