package com.example.cmManagementSystem.dto;

import com.example.cmManagementSystem.entity.EventParticipation;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EventParticipationDto {
    
    private Long id;
    
    private Long eventId;
    
    private String eventTitle;
    
    private String eventImage;
    
    private LocalDateTime eventStartDate;
    
    private String eventLocation;
    
    private Long userId;
    
    private String userName;
    
    private EventParticipation.ParticipationStatus status;
    
    private LocalDateTime registrationDate;
    
    private LocalDateTime attendanceDate;
    
    private LocalDateTime cancellationDate;
    
    private String feedback;
    
    private Integer feedbackRating;
    
    private String specialRequirements;
    
    private String dietRestrictions;
} 