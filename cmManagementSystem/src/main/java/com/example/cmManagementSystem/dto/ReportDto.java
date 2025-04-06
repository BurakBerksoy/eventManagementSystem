package com.example.cmManagementSystem.dto;

import com.example.cmManagementSystem.entity.Report;
import jakarta.validation.constraints.NotBlank;
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
public class ReportDto {
    
    private Long id;
    
    @NotBlank(message = "Başlık zorunludur")
    private String title;
    
    private String description;
    
    private String reportData;
    
    @NotNull(message = "Rapor tipi zorunludur")
    private Report.ReportType type;
    
    private String reportParameters;
    
    private LocalDateTime startDate;
    
    private LocalDateTime endDate;
    
    private String fileUrl;
    
    private Long clubId;
    
    private String clubName;
    
    private Long eventId;
    
    private String eventTitle;
    
    @NotNull(message = "Oluşturan ID zorunludur")
    private Long createdById;
    
    private String createdByName;
    
    private Boolean isPublic;
    
    private Boolean isScheduled;
    
    private String scheduleInterval;
    
    private LocalDateTime lastRunDate;
    
    private LocalDateTime nextRunDate;
    
    private LocalDateTime createdAt;
    
    private LocalDateTime updatedAt;
} 