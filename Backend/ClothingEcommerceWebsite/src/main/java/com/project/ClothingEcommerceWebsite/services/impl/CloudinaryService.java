package com.project.ClothingEcommerceWebsite.services.impl;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@Service
public class CloudinaryService {
    private final Cloudinary cloudinary;

    public CloudinaryService(Cloudinary cloudinary) {
        this.cloudinary = cloudinary;
    }

    public Map uploadFile(MultipartFile file) {
        try {
            // Upload file trực tiếp lên Cloudinary
            return cloudinary.uploader().upload(file.getBytes(), ObjectUtils.asMap(
                    "folder", "uploads_springboot"
            ));
        } catch (IOException e) {
            throw new RuntimeException("Lỗi upload lên Cloudinary: " + e.getMessage());
        }
    }

    public Map deleteFile(String publicId) {
        try {
            return cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
        } catch (IOException e) {
            throw new RuntimeException("Lỗi xóa file trên Cloudinary: " + e.getMessage());
        }
    }
}
