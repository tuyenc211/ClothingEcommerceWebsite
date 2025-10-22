package com.project.ClothingEcommerceWebsite.dtos.request;

import lombok.Data;

@Data
public class UpdateInventoryRequest {
    private Long variantId;
    private Integer quantity;
}
