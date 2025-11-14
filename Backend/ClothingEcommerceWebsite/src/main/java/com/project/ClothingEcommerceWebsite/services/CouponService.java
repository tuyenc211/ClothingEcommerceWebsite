package com.project.ClothingEcommerceWebsite.services;

import com.project.ClothingEcommerceWebsite.dtos.request.CreateCouponRequest;
import com.project.ClothingEcommerceWebsite.models.Coupon;
import com.project.ClothingEcommerceWebsite.models.ProductImage;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface CouponService {
    Coupon createCoupon(CreateCouponRequest request);
    List<Coupon> getAllCoupons();
    Coupon getCouponById(Long id);
    Coupon updateCoupon(Long id, CreateCouponRequest request);
    void deleteCoupon(Long id);
    String uploadAndSaveImages(MultipartFile file, Long couponId);
}
