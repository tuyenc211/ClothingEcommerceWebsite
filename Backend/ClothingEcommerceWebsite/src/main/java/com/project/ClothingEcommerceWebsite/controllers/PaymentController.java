package com.project.ClothingEcommerceWebsite.controllers;

import com.project.ClothingEcommerceWebsite.services.OrderService;
import com.project.ClothingEcommerceWebsite.services.VNPayService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletResponse;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("${api.prefix}/payment")
@RequiredArgsConstructor
public class PaymentController {
    private final VNPayService vnPayService;
    private final OrderService orderService;

    @Value("${spring.vnpay.secret-key}")
    private String vnpaySecretKey;

    @PostMapping("/create")
    public ResponseEntity<Map<String, String>> createPayment(@RequestParam Long amount, @RequestParam String orderId) throws Exception {

        String url = vnPayService.createPaymentUrl(amount, orderId);
        Map<String, String> response = new HashMap<>();
        response.put("paymentUrl", url);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/vn-pay-callback")
    public void handleVnPayCallback(@RequestParam Map<String, String> allParams, HttpServletResponse response) {
        try {
            String secureHash = allParams.get("vnp_SecureHash");

            boolean isValid = vnPayService.verifyPaymentCallback(allParams, vnpaySecretKey, secureHash);
            if (!isValid) {
                ResponseEntity.status(400).body("Chữ ký không hợp lệ.");
            }

            String responseCode = allParams.get("vnp_ResponseCode");
            String orderId = allParams.get("vnp_TxnRef");
            Long neworderId = Long.parseLong(orderId);
            if ("00".equals(responseCode)) {
                orderService.updatePaymentStatus(neworderId, "PAID");
                response.sendRedirect("http://localhost:3000/checkout?status=success");
                // response.sendRedirect("http://clothing-ecommerce-website-client.vercel.app/checkout?status=success");
            } else {
                orderService.updatePaymentStatus(neworderId, "FAILED");
                response.sendRedirect("http://localhost:3000/checkout?status=fail");
                // response.sendRedirect("http://clothing-ecommerce-website-client.vercel.app/checkout?status=success");
            }

        } catch (Exception e) {
            ResponseEntity.status(400).body("Chữ ký không hợp lệ.");
        }
    }
}
