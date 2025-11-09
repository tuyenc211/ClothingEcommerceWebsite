// controllers/ReviewController.java
package com.project.ClothingEcommerceWebsite.controllers;

import com.project.ClothingEcommerceWebsite.dtos.request.*;
import com.project.ClothingEcommerceWebsite.dtos.respond.ReviewResponse;
import com.project.ClothingEcommerceWebsite.models.Review;
import com.project.ClothingEcommerceWebsite.services.ReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("${api.prefix}/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;

    @PostMapping("")
    public ResponseEntity<Review> create(@Valid @RequestBody CreateReviewRequest req) {
        return ResponseEntity.ok(reviewService.createReview(req.getUserId(), req));
    }


    @PutMapping("/{id}")
    public ResponseEntity<Review> updateReview(@PathVariable Long id,
                                         @Valid @RequestBody CreateReviewRequest request) {
        return ResponseEntity.ok(reviewService.updateReview(request.getUserId(), id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id,
                                       @RequestParam Long userId) {
        reviewService.deleteReview(userId, id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/product/{productId}")
    public ResponseEntity<List<Review>> listByProduct(@PathVariable Long productId) {
        return ResponseEntity.ok(reviewService.getReviewByProduct(productId));
    }

    @GetMapping("/user/userId}")
    public ResponseEntity<List<Review>> listByUser(@PathVariable Long userId) {
        return ResponseEntity.ok(reviewService.getReviewByUser(userId));
    }
}
