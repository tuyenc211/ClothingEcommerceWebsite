package com.project.ClothingEcommerceWebsite.services.impl;

import com.project.ClothingEcommerceWebsite.dtos.request.CreateCouponRequest;
import com.project.ClothingEcommerceWebsite.exception.BadRequestException;
import com.project.ClothingEcommerceWebsite.models.Coupon;
import com.project.ClothingEcommerceWebsite.models.Product;
import com.project.ClothingEcommerceWebsite.models.ProductImage;
import com.project.ClothingEcommerceWebsite.repositories.CouponRedemptionRepository;
import com.project.ClothingEcommerceWebsite.repositories.CouponRepository;
import com.project.ClothingEcommerceWebsite.services.CouponService;
import com.project.ClothingEcommerceWebsite.utils.CloudinaryUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CouponServiceImpl implements CouponService {
    private final CouponRepository couponRepository;
    private final CloudinaryService cloudinaryService;
    private final CouponRedemptionRepository redemptionRepository;
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
                .imageUrl(null)
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
        String keepImageUrl = updatedCoupon.getKeepImageUrl();
        if (keepImageUrl == null) {
            keepImageUrl = "";
        }
        if (!keepImageUrl.equals(coupon.getImageUrl())) {
            try {
                cloudinaryService.deleteImage(CloudinaryUtil.extractPublicIdFromUrl(coupon.getImageUrl()));
            } catch (Exception e) {
                System.err.println("Warning: Could not delete image: " + e.getMessage());
            }
        }
        coupon.setName(updatedCoupon.getName());
        coupon.setCode(updatedCoupon.getCode());
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
        Coupon coupon = couponRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Coupon not found"));

        if (coupon.getImageUrl() != null) {
            cloudinaryService.deleteImage(CloudinaryUtil.extractPublicIdFromUrl(coupon.getImageUrl()));
        }

        couponRepository.delete(coupon);
    }

    @Override
    public String uploadAndSaveImages(MultipartFile file, Long couponId) {
        Coupon coupon = couponRepository.findById(couponId)
                .orElseThrow(() -> new RuntimeException("Coupon not found"));
        String imageUrl = cloudinaryService.uploadImage(file);
        coupon.setImageUrl(imageUrl);
        couponRepository.save(coupon);
        return imageUrl;
    }

    @Override
    public List<Coupon> getAvailableCoupons(Long userId, Double orderTotal) {
        List<Coupon> allCoupons = couponRepository.findAll();
        LocalDateTime now = LocalDateTime.now();

        return allCoupons.stream()
                .filter(coupon -> {
                    if (!coupon.getIsActive()) return false;

                    if (coupon.getStartsAt() != null && now.isBefore(coupon.getStartsAt())) {
                        return false;
                    }
                    if (coupon.getEndsAt() != null && now.isAfter(coupon.getEndsAt())) {
                        return false;
                    }

                    if (coupon.getMinOrderTotal() != null && orderTotal < coupon.getMinOrderTotal()) {
                        return false;
                    }

                    if (coupon.getMaxUses() != null) {
                        Long totalUsed = redemptionRepository.countByCouponId(coupon.getId());
                        if (totalUsed >= coupon.getMaxUses()) return false;
                    }

                    if (coupon.getMaxUsesPerUser() != null) {
                        Long userUsed = redemptionRepository.countByCouponIdAndUserId(
                                coupon.getId(), userId
                        );
                        if (userUsed >= coupon.getMaxUsesPerUser()) return false;
                    }

                    return true;
                })
                .collect(Collectors.toList());
    }
}
