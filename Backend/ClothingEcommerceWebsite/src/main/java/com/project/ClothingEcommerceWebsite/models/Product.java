package com.project.ClothingEcommerceWebsite.models;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.*;

import javax.persistence.*;

@Entity
@Table(name = "products")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 100)
    private String sku;

    @Column(nullable = false, unique = true, length = 280)
    private String slug;

    @Column(nullable = false, length = 255)
    private String name;

    @Column(columnDefinition = "MEDIUMTEXT")
    private String description;

    @Column(name = "base_price", nullable = false)
    private Double basePrice;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "category_id")
    private Category category;

    @Column(name = "is_published", nullable = false)
    private Boolean isPublished = true;
}
