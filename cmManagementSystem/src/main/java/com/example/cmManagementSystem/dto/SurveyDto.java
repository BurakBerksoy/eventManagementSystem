package com.example.cmManagementSystem.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SurveyDto {
    
    private Long id;
    
    @NotBlank(message = "Başlık zorunludur")
    private String title;
    
    private String description;
    
    private Long clubId;
    
    private String clubName;
    
    private Long eventId;
    
    private String eventTitle;
    
    private LocalDateTime startDate;
    
    private LocalDateTime endDate;
    
    private Boolean isAnonymous;
    
    private Boolean isPublished;
    
    private Boolean isRequired;
    
    private String targetAudience;
    
    private Integer maxResponses;
    
    private Integer responseCount;
    
    private Long createdById;
    
    private String createdByName;
    
    private LocalDateTime createdAt;
    
    private LocalDateTime updatedAt;
    
    private List<SurveyQuestionDto> questions;
    
    private boolean isActive;
    
    private boolean hasResponded;
} 