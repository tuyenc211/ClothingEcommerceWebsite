package com.project.ClothingEcommerceWebsite.dtos.respond;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductVariantResponse {
    private Long id;
    private String sku;
    private Double price;
    private SizeResponse size;
    private ColorResponse color;
}

