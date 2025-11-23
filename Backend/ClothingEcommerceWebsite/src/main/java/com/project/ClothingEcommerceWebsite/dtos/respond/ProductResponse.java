package com.project.ClothingEcommerceWebsite.dtos.respond;

import com.project.ClothingEcommerceWebsite.models.*;
import lombok.*;

import java.util.List;
import java.util.Set;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductResponse {
    private Long id;
    private String sku;
    private String name;
    private String slug;
    private String description;
    private Double basePrice;
    private Boolean isPublished;
    private Category category;
    private Set<SizeResponse> sizes;
    private Set<ColorResponse> colors;
    private List<ProductImageResponse> images;
    private List<ProductVariant> variants;
    private List<Inventory> inventories;
    private List<ReviewResponse> reviews;

}

