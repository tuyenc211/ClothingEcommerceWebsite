package com.project.ClothingEcommerceWebsite.dtos.respond;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SizeResponse {
    private Long id;
    private String code;
    private String name;
    private Integer sortOrder;
}

