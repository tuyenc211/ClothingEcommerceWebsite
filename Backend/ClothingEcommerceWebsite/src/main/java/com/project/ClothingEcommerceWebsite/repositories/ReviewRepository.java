package com.project.ClothingEcommerceWebsite.repositories;

import com.project.ClothingEcommerceWebsite.models.Review;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ReviewRepository extends JpaRepository<Review, Long> {
    boolean existsByUserIdAndOrderId(Long userId, Long orderId);
    List<Review> findAllByProductId(Long productId);
    List<Review> findAllByUserId(Long userId);
    List<Review> findAllByProduct_IdIn(List<Long> productIds);
}
