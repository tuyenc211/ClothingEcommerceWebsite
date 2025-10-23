package com.project.ClothingEcommerceWebsite.utils;

public class CloudinaryUtil {
    public static String extractPublicIdFromUrl(String imageUrl) {
        // Ví dụ: https://res.cloudinary.com/mycloud/image/upload/v1730000000/clothing_ecommerce/uploads/tshirt_red_01.jpg
        String[] parts = imageUrl.split("/upload/");
        if (parts.length < 2) {
            throw new IllegalArgumentException("Invalid Cloudinary URL");
        }

        // Lấy phần sau /upload/
        String path = parts[1];
        // Bỏ phần version (nếu có) và đuôi .jpg, .png...
        path = path.substring(path.indexOf("/") + 1); // bỏ v1730000000/
        int dotIndex = path.lastIndexOf(".");
        if (dotIndex != -1) {
            path = path.substring(0, dotIndex);
        }
        return path;
    }
}
