package com.project.ClothingEcommerceWebsite.repositories;

import com.project.ClothingEcommerceWebsite.models.CouponRedemption;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface CouponRedemptionRepository extends JpaRepository<CouponRedemption, Long> {
    Long countByCouponId(Long couponId);

    Long countByCouponIdAndUserId(Long couponId, Long userId);

    boolean existsByCouponIdAndUserId(Long couponId, Long userId);

    List<CouponRedemption> findAllByUserId(Long userId);

    List<CouponRedemption> findAllByCouponId(Long couponId);

    Optional<CouponRedemption> findByOrderId(Long orderId);

    @Query("SELECT cr FROM CouponRedemption cr " +
            "JOIN FETCH cr.coupon " +
            "WHERE cr.user.id = :userId " +
            "ORDER BY cr.redeemedAt DESC")
    List<CouponRedemption> findAllByUserIdWithCoupon(@Param("userId") Long userId);

    @Query("SELECT COUNT(cr) FROM CouponRedemption cr " +
            "WHERE cr.coupon.id = :couponId " +
            "AND cr.order.status != 'CANCELLED'")
    Long countActiveRedemptionsByCouponId(@Param("couponId") Long couponId);
}
