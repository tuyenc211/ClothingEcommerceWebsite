package com.project.ClothingEcommerceWebsite.dtos.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ChangeUserRequest {
    private String fullName;
    private String phone;
}
