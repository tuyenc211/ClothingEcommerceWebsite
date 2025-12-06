package com.project.ClothingEcommerceWebsite.services.impl;

import com.project.ClothingEcommerceWebsite.configs.VnPayConfig;
import com.project.ClothingEcommerceWebsite.services.VNPayService;
import jakarta.xml.bind.DatatypeConverter;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.util.*;

@Service
@RequiredArgsConstructor
public class VNPayServiceImpl implements VNPayService {

    private final VnPayConfig config;

    @Override
    public String createPaymentUrl(Long amount, String orderId) {
        Map<String, String> params = new HashMap<>();
        params.put("vnp_Version", config.getVersion());
        params.put("vnp_Command", config.getCommand());
        params.put("vnp_TmnCode", config.getTmnCode());
        params.put("vnp_Amount", String.valueOf(amount * 100));
        params.put("vnp_TxnRef", orderId);
        params.put("vnp_OrderInfo", "Thanh toan don hang: " + orderId);
        params.put("vnp_Locale", "vn");
        params.put("vnp_ReturnUrl", config.getReturnUrl());
        params.put("vnp_IpAddr", "127.0.0.1");
        params.put("vnp_CreateDate", new SimpleDateFormat("yyyyMMddHHmmss").format(new Date()));
        params.put("vnp_OrderType", "other");
        params.put("vnp_ExpireDate", new SimpleDateFormat("yyyyMMddHHmmss").format(new Date(System.currentTimeMillis() + 20 * 60 * 1000)));
        params.put("vnp_CurrCode", "VND");
        Map<String, String> sortedParams = new TreeMap<>(params);

        StringBuilder hashData = new StringBuilder();
        StringBuilder query = new StringBuilder();

        try {
            for (Map.Entry<String, String> entry : sortedParams.entrySet()) {
                String encodedKey = URLEncoder.encode(entry.getKey(), StandardCharsets.UTF_8.toString());
                String encodedValue = URLEncoder.encode(entry.getValue(), StandardCharsets.UTF_8.toString());

                hashData.append(encodedKey).append('=').append(encodedValue).append('&');
                query.append(entry.getKey()).append('=').append(encodedValue).append('&');
            }

            hashData.setLength(hashData.length() - 1);
            query.setLength(query.length() - 1);

            String secureHash = hmacSHA512(config.getSecretKey(), hashData.toString());

            String paymentUrl = config.getPayUrl() + "?" + query + "&vnp_SecureHash=" + secureHash;

            return paymentUrl;

        } catch (Exception e) {
            throw new RuntimeException("Lỗi khi tạo URL thanh toán VNPay", e);
        }
    }

    private String hmacSHA512(String key, String data) {
        try {
            SecretKeySpec secretKeySpec = new SecretKeySpec(key.getBytes(StandardCharsets.UTF_8), "HmacSHA512");
            Mac mac = Mac.getInstance("HmacSHA512");
            mac.init(secretKeySpec);
            byte[] bytes = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
            return DatatypeConverter.printHexBinary(bytes).toUpperCase();
        } catch (Exception e) {
            throw new RuntimeException("Lỗi khi tạo HMAC SHA512", e);
        }
    }

@Override
public boolean verifyPaymentCallback(Map<String, String> params, String secureHashSecret, String receivedHash) {
    try {
        Map<String, String> filteredParams = new TreeMap<>(); 
        for (Map.Entry<String, String> entry : params.entrySet()) {
            if (entry.getKey().startsWith("vnp_") &&
                    !entry.getKey().equals("vnp_SecureHash") &&
                    !entry.getKey().equals("vnp_SecureHashType")) {
                filteredParams.put(entry.getKey(), entry.getValue());
            }
        }

        StringBuilder hashData = new StringBuilder();
        for (Map.Entry<String, String> entry : filteredParams.entrySet()) {
            String encodedValue = URLEncoder.encode(entry.getValue(), StandardCharsets.UTF_8.toString());
            hashData.append(entry.getKey()).append('=').append(encodedValue).append('&');
        }

        if (hashData.length() > 0) {
            hashData.setLength(hashData.length() - 1);
        }

        String calculatedHash = hmacSHA512(secureHashSecret, hashData.toString());

        return calculatedHash.equalsIgnoreCase(receivedHash);
    } catch (Exception e) {
        e.printStackTrace();
        return false;
    }
}
}
