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
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

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
        if (reviewRepository.existsByUserIdAndOrderId(user.getId(), order.getId())) {
            throw new RuntimeException("Bạn đã đánh giá sản phẩm này rồi.");
        }
        Review review = Review.builder()
                .user(user)
                .product(product)
                .order(order)
                .rating(request.getRating())
                .title(request.getTitle())
                .content(request.getContent())
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
    public List<Review> getReviewByProduct(Long productId) {
        return reviewRepository.findAllByProductId(productId);
    }

    @Override
    public List<Review> getReviewByUser(Long userId) {
        return reviewRepository.findAllByUserId(userId);
    }
}
