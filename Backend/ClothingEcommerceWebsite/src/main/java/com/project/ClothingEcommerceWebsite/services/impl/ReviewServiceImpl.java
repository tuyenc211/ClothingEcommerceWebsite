package com.project.ClothingEcommerceWebsite.services.impl;

import com.project.ClothingEcommerceWebsite.dtos.request.CreateReviewRequest;
import com.project.ClothingEcommerceWebsite.models.Order;
import com.project.ClothingEcommerceWebsite.models.Product;
import com.project.ClothingEcommerceWebsite.models.Review;
import com.project.ClothingEcommerceWebsite.models.User;
import com.project.ClothingEcommerceWebsite.repositories.OrderRepository;
import com.project.ClothingEcommerceWebsite.repositories.ProductRepository;
import com.project.ClothingEcommerceWebsite.repositories.ReviewRepository;
import com.project.ClothingEcommerceWebsite.repositories.UserRepository;
import com.project.ClothingEcommerceWebsite.services.ReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import javax.transaction.Transactional;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ReviewServiceImpl implements ReviewService {
    private final ReviewRepository reviewRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final OrderRepository orderRepository;

    @Override
    @Transactional
    public Review createReview(Long userId, CreateReviewRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new RuntimeException("Product not found"));
        Order order = orderRepository.findById(request.getOrderId())
                .orElseThrow(() -> new RuntimeException("Order not found"));
        if (!reviewRepository.hasDeliveredOrderForProduct(user.getId(), product.getId())) {
            throw new RuntimeException("Bạn chỉ có thể đánh giá sản phẩm đã mua và đã giao.");
        }
        if (reviewRepository.existsByUserIdAndProductId(user.getId(), product.getId())) {
            throw new RuntimeException("Bạn đã đánh giá sản phẩm này rồi.");
        }
        Review review = Review.builder()
                .user(user)
                .product(product)
                .order(order)
                .rating(request.getRating())
                .title(request.getTitle())
                .content(request.getContent())
                .isApproved(false)
                .createdAt(LocalDateTime.now())
                .build();
        return reviewRepository.save(review);
    }

    @Override
    public Review updateReview(Long userId, Long reviewId, CreateReviewRequest request) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new RuntimeException("Review not found"));
        if (!review.getUser().getId().equals(userId)) {
            throw new RuntimeException("Không có quyền sửa review này");
        }
        review.setRating(request.getRating());
        review.setTitle(request.getTitle());
        review.setContent(request.getContent());
        review.setIsApproved(false);
        return reviewRepository.save(review);
    }

    @Override
    public void deleteReview(Long userId, Long reviewId) {
        Review r = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new RuntimeException("Review not found"));
        if (!r.getUser().getId().equals(userId)) {
            throw new RuntimeException("Không có quyền xóa review này");
        }
        reviewRepository.delete(r);
    }

    @Override
    public List<Review> getApprovedByProduct(Long productId) {
        Pageable pageable = Pageable.unpaged();
        return reviewRepository.findByProductIdAndIsApprovedTrue(productId, pageable)
                .getContent();
    }

    @Override
    public Review approve(Long reviewId, boolean approved) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new RuntimeException("Review not found"));
        review.setIsApproved(approved);
        return reviewRepository.save(review);
    }
}
