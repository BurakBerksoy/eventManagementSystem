package com.example.cmManagementSystem.dto;

import com.example.cmManagementSystem.entity.SurveyQuestion;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
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
public class SurveyQuestionDto {
    
    private Long id;
    
    @NotNull(message = "Anket ID zorunludur")
    private Long surveyId;
    
    @NotBlank(message = "Soru metni zorunludur")
    private String questionText;
    
    @NotNull(message = "Soru tipi zorunludur")
    private SurveyQuestion.QuestionType questionType;
    
    private String options;
    
    private Boolean isRequired;
    
    private Integer orderIndex;
    
    private String hint;
    
    private String validationRegex;
    
    private Integer minValue;
    
    private Integer maxValue;
    
    private LocalDateTime createdAt;
    
    private LocalDateTime updatedAt;
    
    private List<SurveyResponseDto> responses;
    
    // Analiz için alanlar
    private Double averageRating;
    private Integer responseCount;
} 