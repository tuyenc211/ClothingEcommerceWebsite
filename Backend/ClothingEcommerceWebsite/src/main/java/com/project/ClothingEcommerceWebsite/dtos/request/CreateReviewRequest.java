package com.project.ClothingEcommerceWebsite.dtos.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;


@Data
@AllArgsConstructor
@NoArgsConstructor
public class CreateReviewRequest {
    @NotNull
    private Long userId;

    @NotNull
    private Long productId;

    @NotNull
    private Long orderId;

    @NotNull @Min(1) @Max(5)
    private Integer rating;

    private String title;

    private String content;
}
