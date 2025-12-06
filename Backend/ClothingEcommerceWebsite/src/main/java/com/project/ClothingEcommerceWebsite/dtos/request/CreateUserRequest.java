package com.project.ClothingEcommerceWebsite.dtos.request;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateUserRequest {
    @NotBlank(message = "Email cannot be blank")
    @Email(message = "Email is not valid")
    private String email;

    @NotBlank(message = "Password cannot be blank")
    @Size(min = 6, message = "Password must be at least 6 characters long")
    private String password;

    @NotBlank(message = "Full name cannot be blank")
    private String fullName;

    private String phone;

    private Boolean isActive = true;

    private List<Long> roleIds;
}
