package com.project.ClothingEcommerceWebsite.dtos.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CreateSizeRequest {
    @NotBlank(message = "Size code cannot be blank")
    private String code;

    @NotBlank(message = "Size name cannot be blank")
    private String name;

    @PositiveOrZero(message = "Sort order must be zero or positive")
    private Integer sortOrder;
}
