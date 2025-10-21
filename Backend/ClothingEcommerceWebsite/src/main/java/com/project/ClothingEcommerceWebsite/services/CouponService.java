package com.project.ClothingEcommerceWebsite.services;

import com.project.ClothingEcommerceWebsite.dtos.request.CreateCouponRequest;
import com.project.ClothingEcommerceWebsite.models.Coupon;

import java.util.List;
import java.util.Optional;

public interface CouponService {
    Coupon createCoupon(CreateCouponRequest request);
    List<Coupon> getAllCoupons();
    Coupon getCouponById(Long id);
    Coupon updateCoupon(Long id, CreateCouponRequest request);
    void deleteCoupon(Long id);
}
