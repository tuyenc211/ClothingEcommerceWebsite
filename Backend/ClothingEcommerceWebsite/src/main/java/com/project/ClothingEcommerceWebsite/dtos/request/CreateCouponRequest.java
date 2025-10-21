package com.project.ClothingEcommerceWebsite.dtos.request;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateCouponRequest {
    private String code;
    private String name;
    private String description;
    private Double value;
    private Integer maxUses;
    private Integer maxUsesPerUser;
    private Double minOrderTotal;
    private LocalDateTime startsAt;
    private LocalDateTime endsAt;
    private Boolean isActive;
}
