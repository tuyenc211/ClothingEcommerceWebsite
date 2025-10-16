package com.project.ClothingEcommerceWebsite.dtos.request;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateProductRequest {
    private String sku;
    private String name;
    private String slug;
    private String description;
    private Double basePrice;
    private Long categoryId;
    private Boolean isPublished;
}
