package com.project.ClothingEcommerceWebsite.dtos.request;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateAddressRequest {
    private Long userId;
    private String line;
    private String ward;
    private String district;
    private String province;
    private String country;
    private Boolean isDefault;
}
