package com.project.ClothingEcommerceWebsite.models;

import lombok.*;

import javax.persistence.*;

@Entity
@Table(name = "product_images")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductImage {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Column(name = "image_url", length = 500, nullable = false)
    private String imageUrl;

    @Column(name = "position")
    private Integer position;
}
