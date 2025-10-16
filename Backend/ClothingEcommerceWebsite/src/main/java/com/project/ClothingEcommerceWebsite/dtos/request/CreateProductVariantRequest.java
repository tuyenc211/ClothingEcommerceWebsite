package com.project.ClothingEcommerceWebsite.dtos.request;

import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateProductVariantRequest {
    private String sku;
    private String name;
    private String slug;
    private String description;
    private Double basePrice;
    private Long categoryId;
    private Boolean isPublished;
    private List<Long> sizeIds;
    private List<Long> colorIds;
}
