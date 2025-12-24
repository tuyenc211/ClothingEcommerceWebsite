package com.project.ClothingEcommerceWebsite.dtos.respond;

import com.project.ClothingEcommerceWebsite.models.Category;
import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductListResponse {
    private Long id;
    private String sku;
    private String name;
    private String slug;
    private String description;
    private Double basePrice;
    private Boolean isPublished;
    private Category category;
    private List<ProductImageResponse> images;
    private int totalStock;
}
