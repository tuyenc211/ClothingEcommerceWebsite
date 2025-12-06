package com.project.ClothingEcommerceWebsite.models;

import lombok.*;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "coupons")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Coupon {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 50)
    private String code;

    @Column(nullable = false, length = 255)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private Double value;

    @Column(name = "max_uses")
    private Integer maxUses;

    @Column(name = "max_uses_per_user")
    private Integer maxUsesPerUser;

    @Column(name = "min_order_total")
    private Double minOrderTotal;

    @Column(name = "starts_at")
    private LocalDateTime startsAt;

    @Column(name = "ends_at")
    private LocalDateTime endsAt;

    @Column(name = "is_active")
    private Boolean isActive;

    @Column(name = "image_url")
    private String imageUrl;
}
