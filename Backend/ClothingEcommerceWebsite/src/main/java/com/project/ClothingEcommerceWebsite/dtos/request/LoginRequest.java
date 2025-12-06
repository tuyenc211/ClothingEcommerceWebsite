package com.project.ClothingEcommerceWebsite.dtos.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;


@Data
@AllArgsConstructor
@NoArgsConstructor
public class LoginRequest {
    @NotNull(message = "Email rỗng")
    @NotEmpty(message = "Email rỗng")
    @Email(message = "Email không hợp lệ")
    private String email;

    @NotNull(message = "Mật khẩu rỗng")
    @NotEmpty(message = "Mật khẩu rỗng")
    @Size(min = 6, max = 30, message = "Mật khẩu có từ 6-30 ký tự")
    private String password;
}
