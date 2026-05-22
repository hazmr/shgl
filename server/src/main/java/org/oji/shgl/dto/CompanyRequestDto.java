package org.oji.shgl.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;

public record CompanyRequestDto(
        @NotBlank
        @Size(max = 255)
        String name,

        @Size(max = 500)
        String logo,

        @NotBlank
        @Size(max = 100)
        String industry,

        @NotBlank
        @Size(max = 50)
        String size,

        @NotNull
        BigDecimal rating,

        @Size(max = 1000)
        String locations,

        @NotNull
        Integer founded,

        String description,

        Integer employees,

        @Size(max = 500)
        String website
) {}
