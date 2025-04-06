package com.example.cmManagementSystem.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SurveyResponseDto {
    
    private Long id;
    
    @NotNull(message = "Anket ID zorunludur")
    private Long surveyId;
    
    @NotNull(message = "Soru ID zorunludur")
    private Long questionId;
    
    private Long userId;
    
    private String userName;
    
    private String anonymousUserToken;
    
    private String responseText;
    
    private Integer responseValue;
    
    private String selectedOptions;
    
    private String ipAddress;
    
    private String userAgent;
    
    private LocalDateTime createdAt;
    
    private LocalDateTime updatedAt;
} 