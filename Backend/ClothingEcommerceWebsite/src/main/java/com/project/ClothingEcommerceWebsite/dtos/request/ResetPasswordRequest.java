package com.project.ClothingEcommerceWebsite.dtos.request;

import lombok.Data;

@Data
public class ResetPasswordRequest {
    private String token;
    private String newPassword;
}
