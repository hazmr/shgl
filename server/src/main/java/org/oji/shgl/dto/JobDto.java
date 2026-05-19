package org.oji.shgl.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import org.oji.shgl.entity.Job;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.Instant;
//TODO : fix the problem with n+1 problem and refactor the dtoS and refactor the current structure of the endpoints

// TODO: learn more about the hibernate relation mapping and it's annotations

// TODO: learn more about StructMap
/**
 * DTO for {@link Job}
 */
public record JobDto(Instant createdAt, String createdBy, Instant updatedAt, String updatedBy, Long id,
     @NotNull @Size(max = 255) String title, @NotNull String companyName,
     @NotNull @Size(max = 255) String location, @NotNull @Size(max = 50) String workType,
     @NotNull @Size(max = 50) String jobType, @NotNull @Size(max = 100) String category,
     @NotNull @Size(max = 50) String experienceLevel, @NotNull BigDecimal salaryMin,
     @NotNull BigDecimal salaryMax, @NotNull @Size(max = 10) String salaryCurrency,
     @NotNull @Size(max = 20) String salaryPeriod, @NotNull String description, String requirements,
     String benefits, @NotNull Instant postedDate, Instant applicationDeadline,
     Integer applicationsCount, Boolean featured, Boolean urgent, Boolean remote,
     @NotNull @Size(max = 20) String status) implements Serializable {
}