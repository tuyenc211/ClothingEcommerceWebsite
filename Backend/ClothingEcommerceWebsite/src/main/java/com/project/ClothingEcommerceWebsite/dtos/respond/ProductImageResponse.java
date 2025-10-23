package com.project.ClothingEcommerceWebsite.dtos.respond;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductImageResponse {
    private Long id;
    private String image_url;
    private Integer position;
}
