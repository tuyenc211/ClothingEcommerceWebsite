package com.project.ClothingEcommerceWebsite.dtos.request;

import com.project.ClothingEcommerceWebsite.models.Enums;
import lombok.Data;

@Data
public class CreateOrderRequest {
    private Enums.PaymentMethod paymentMethod;
    private Object shippingAddress;
    private String couponCode;
}
