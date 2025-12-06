package com.project.ClothingEcommerceWebsite.dtos.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;


@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateColorRequest {
    @NotBlank(message = "Color code cannot be blank")
    @Size(max = 50, message = "Code must be <= 50 characters")
    private String code;

    @NotBlank(message = "Color name cannot be blank")
    @Size(max = 100, message = "Name must be <= 100 characters")
    private String name;
}
