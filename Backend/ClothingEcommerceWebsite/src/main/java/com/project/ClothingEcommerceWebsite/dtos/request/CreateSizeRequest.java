package com.project.ClothingEcommerceWebsite.dtos.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import javax.validation.constraints.PositiveOrZero;

import javax.validation.constraints.NotBlank;

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
