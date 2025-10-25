package com.project.ClothingEcommerceWebsite.dtos.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ChangePasswordRequest {
    
    private String email;

    private String oldPassword;

    private String newPassword;
    
}
