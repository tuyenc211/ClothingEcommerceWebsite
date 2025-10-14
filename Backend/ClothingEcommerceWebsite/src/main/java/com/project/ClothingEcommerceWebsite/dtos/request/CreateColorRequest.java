package com.project.ClothingEcommerceWebsite.dtos.request;

import lombok.*;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.Size;

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
