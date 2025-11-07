package com.project.ClothingEcommerceWebsite.configs;

import lombok.Getter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
@Getter
public class VnPayConfig {

    @Value("${spring.vnpay.tmn-code}")
    private String tmnCode;

    @Value("${spring.vnpay.secret-key}")
    private String secretKey;

    @Value("${spring.vnpay.pay-url}")
    private String payUrl;

    @Value("${spring.vnpay.return-url}")
    private String returnUrl;

    @Value("${spring.vnpay.version}")
    private String version;

    @Value("${spring.vnpay.command}")
    private String command;

    @Value("${spring.vnpay.order-type}")
    private String orderType;
}
