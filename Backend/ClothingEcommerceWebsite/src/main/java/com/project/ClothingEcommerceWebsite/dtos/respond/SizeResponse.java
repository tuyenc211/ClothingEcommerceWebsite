package com.project.ClothingEcommerceWebsite.dtos.respond;

import lombok.*;

import java.util.Objects;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SizeResponse {
    private Long id;
    private String code;
    private String name;
    private Integer sortOrder;

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof SizeResponse)) return false;
        SizeResponse that = (SizeResponse) o;
        return Objects.equals(id, that.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }

}

