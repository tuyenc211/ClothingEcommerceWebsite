package com.project.ClothingEcommerceWebsite.services;

import com.project.ClothingEcommerceWebsite.dtos.request.CreateReviewRequest;
import com.project.ClothingEcommerceWebsite.models.Review;

import java.util.List;

public interface ReviewService {
    Review createReview(Long userId, CreateReviewRequest request);
    Review updateReview(Long userId, Long reviewId, CreateReviewRequest request);
    void deleteReview(Long userId, Long reviewId);

    List<Review> getApprovedByProduct(Long productId);

    Review approve(Long reviewId, boolean approved);
}
