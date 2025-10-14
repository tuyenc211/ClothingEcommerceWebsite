package com.project.ClothingEcommerceWebsite.dtos.request;

import lombok.*;

import javax.validation.constraints.NotNull;

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
