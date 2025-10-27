package com.project.ClothingEcommerceWebsite.repositories;

import com.project.ClothingEcommerceWebsite.models.Review;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface ReviewRepository extends JpaRepository<Review, Long> {
    boolean existsByUserIdAndProductId(Long userId, Long productId);
    Page<Review> findByProductIdAndIsApprovedTrue(Long productId, Pageable pageable);

    @Query(value = """
        SELECT CASE WHEN COUNT(*) > 0 THEN TRUE ELSE FALSE END
        FROM orders o
        JOIN order_items oi ON oi.order_id = o.id
        WHERE o.user_id = :userId
          AND o.status = 'DELIVERED'
          AND oi.product_id = :productId
        """, nativeQuery = true)
    boolean hasDeliveredOrderForProduct(@Param("userId") Long userId,
                                        @Param("productId") Long productId);
}
