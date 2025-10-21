package com.project.ClothingEcommerceWebsite.dtos.respond;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ColorResponse {
    private Long id;
    private String code;
    private String name;
}

