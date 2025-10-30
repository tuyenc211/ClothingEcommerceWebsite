package com.project.ClothingEcommerceWebsite.models;

public class Enums {
    public enum OrderStatus {
        NEW, CONFIRMED, PACKING, SHIPPED, DELIVERED, CANCELLED
    }

    public enum PaymentMethod {
        COD, WALLET
    }

    public enum PaymentStatus {
        UNPAID, PAID, REFUNDED, PARTIAL
    }
}
