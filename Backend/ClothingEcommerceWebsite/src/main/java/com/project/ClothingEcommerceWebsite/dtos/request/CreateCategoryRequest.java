package com.project.ClothingEcommerceWebsite.dtos.request;

import jakarta.validation.constraints.NotNull;
import lombok.*;


@Data
@AllArgsConstructor
@NoArgsConstructor
public class CreateCategoryRequest {
    private Long parentId;
    @NotNull(message = "Name not null")
    private String name;
    private String slug;
    private Boolean isActive;
}
