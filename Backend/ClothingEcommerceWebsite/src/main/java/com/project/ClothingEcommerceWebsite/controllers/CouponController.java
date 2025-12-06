package com.project.ClothingEcommerceWebsite.controllers;

import com.project.ClothingEcommerceWebsite.dtos.request.CreateCategoryRequest;
import com.project.ClothingEcommerceWebsite.dtos.request.CreateCouponRequest;
import com.project.ClothingEcommerceWebsite.models.Category;
import com.project.ClothingEcommerceWebsite.models.Coupon;
import com.project.ClothingEcommerceWebsite.models.ProductImage;
import com.project.ClothingEcommerceWebsite.services.CouponService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("${api.prefix}/coupons")
@RequiredArgsConstructor
public class CouponController {
    private final CouponService couponService;
    @PostMapping("")
    public ResponseEntity<?> createCoupon(@Valid @RequestBody CreateCouponRequest request) {
        Coupon coupon = couponService.createCoupon(request);
        return ResponseEntity.ok(coupon);
    }

    @PostMapping("/{couponId}/upload-image")
    public ResponseEntity<?> uploadImages(
            @PathVariable Long couponId,
            @RequestParam("file") MultipartFile file
    ) {
        if (file == null || file.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "No files provided"));
        }

        String imageUrl = couponService.uploadAndSaveImages(file, couponId);
        return ResponseEntity.ok(Map.of(
                "message", "Image uploaded successfully",
                "url", imageUrl
        ));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getCouponById(@PathVariable Long id) {
        return ResponseEntity.ok(couponService.getCouponById(id));
    }

    @GetMapping("")
    public ResponseEntity<?> getAllCoupon() {
        return ResponseEntity.ok(couponService.getAllCoupons());
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateCoupon(@PathVariable Long id, @RequestBody CreateCouponRequest request) {
        Coupon coupon = couponService.updateCoupon(id, request);
        return ResponseEntity.ok("");
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteCoupon(@PathVariable Long id) {
        couponService.deleteCoupon(id);
        return ResponseEntity.ok("");
    }

    @GetMapping("/available")
    public ResponseEntity<?> getAvailableCoupons(
            @RequestParam Long userId,
            @RequestParam Double orderTotal
    ) {
        List<Coupon> coupons = couponService.getAvailableCoupons(userId, orderTotal);
        return ResponseEntity.ok(coupons);
    }
}
