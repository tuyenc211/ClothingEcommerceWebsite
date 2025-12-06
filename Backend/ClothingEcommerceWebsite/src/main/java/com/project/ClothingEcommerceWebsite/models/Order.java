package com.project.ClothingEcommerceWebsite.models;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.*;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "orders")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String code;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id")
    private User user;

    @Enumerated(EnumType.STRING)
    private Enums.OrderStatus status;

    private Integer totalItems;
    private Double subtotal;
    private Double discountTotal;
    private Double shippingFee;
    private Double grandTotal;

    @Enumerated(EnumType.STRING)
    private Enums.PaymentMethod paymentMethod;

    @Enumerated(EnumType.STRING)
    private Enums.PaymentStatus paymentStatus;

    @Column(columnDefinition = "json")
    private String shippingAddressSnapshot;

    private LocalDateTime placedAt;
    private LocalDateTime paidAt;
    private LocalDateTime cancelledAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<OrderItem> items;
}

