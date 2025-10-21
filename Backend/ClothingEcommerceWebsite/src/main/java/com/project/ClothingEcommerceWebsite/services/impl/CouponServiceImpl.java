package com.project.ClothingEcommerceWebsite.services.impl;

import com.project.ClothingEcommerceWebsite.dtos.request.CreateCouponRequest;
import com.project.ClothingEcommerceWebsite.models.Coupon;
import com.project.ClothingEcommerceWebsite.repositories.CouponRepository;
import com.project.ClothingEcommerceWebsite.services.CouponService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class CouponServiceImpl implements CouponService {
    private final CouponRepository couponRepository;
    @Override
    public Coupon createCoupon(CreateCouponRequest request) {
        Coupon coupon = Coupon.builder()
                .code(request.getCode())
                .name(request.getName())
                .description(request.getDescription())
                .value(request.getValue())
                .maxUses(request.getMaxUses())
                .maxUsesPerUser(request.getMaxUsesPerUser())
                .minOrderTotal(request.getMinOrderTotal())
                .startsAt(request.getStartsAt())
                .endsAt(request.getEndsAt())
                .isActive(request.getIsActive() != null ? request.getIsActive() : true)
                .build();
        couponRepository.save(coupon);
        return coupon;
    }

    @Override
    public List<Coupon> getAllCoupons() {
        return couponRepository.findAll();
    }

    @Override
    public Coupon getCouponById(Long id) {
        return couponRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found with id: " + id));
    }

    @Override
    public Coupon updateCoupon(Long id, CreateCouponRequest updatedCoupon) {
        Coupon coupon = couponRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Coupon not found"));

        coupon.setName(updatedCoupon.getName());
        coupon.setDescription(updatedCoupon.getDescription());
        coupon.setValue(updatedCoupon.getValue());
        coupon.setMaxUses(updatedCoupon.getMaxUses());
        coupon.setMaxUsesPerUser(updatedCoupon.getMaxUsesPerUser());
        coupon.setMinOrderTotal(updatedCoupon.getMinOrderTotal());
        coupon.setStartsAt(updatedCoupon.getStartsAt());
        coupon.setEndsAt(updatedCoupon.getEndsAt());
        coupon.setIsActive(updatedCoupon.getIsActive());

        return couponRepository.save(coupon);
    }

    @Override
    public void deleteCoupon(Long id) {
        couponRepository.deleteById(id);
    }
}
