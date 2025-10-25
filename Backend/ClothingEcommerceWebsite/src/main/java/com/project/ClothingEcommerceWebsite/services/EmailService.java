package com.project.ClothingEcommerceWebsite.services;

public interface EmailService {
    void sendResetPasswordEmail(String title, String toEmail, String resetLink);
}
