package com.project.ClothingEcommerceWebsite.models;

import lombok.*;
import javax.persistence.*;

@Entity
@Table(name = "addresses")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Address {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    private String line;
    private String ward;
    private String district;
    private String province;
    private String country;

    @Column(name = "is_default")
    private Boolean isDefault;
}
