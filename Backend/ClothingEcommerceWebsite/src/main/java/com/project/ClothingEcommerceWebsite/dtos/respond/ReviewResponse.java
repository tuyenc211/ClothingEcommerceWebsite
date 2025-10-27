package com.project.ClothingEcommerceWebsite.dtos.respond;

import java.time.LocalDateTime;

public class ReviewResponse {
    private Long id;
    private Long productId;
    private Long userId;
    private String userName;
    private int rating;
    private String title;
    private String content;
    private boolean approved;
    private LocalDateTime createdAt;
}