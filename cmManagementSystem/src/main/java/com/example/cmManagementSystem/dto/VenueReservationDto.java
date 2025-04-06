package com.example.cmManagementSystem.dto;

import com.example.cmManagementSystem.entity.VenueReservation;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VenueReservationDto {
    
    private Long id;
    
    @NotNull(message = "Mekan ID zorunludur")
    private Long venueId;
    
    private String venueName;
    
    private Long eventId;
    
    private String eventTitle;
    
    private Long clubId;
    
    private String clubName;
    
    @NotNull(message = "Başlangıç zamanı zorunludur")
    private LocalDateTime startTime;
    
    @NotNull(message = "Bitiş zamanı zorunludur")
    private LocalDateTime endTime;
    
    private LocalDateTime reservationDate;
    
    private String reservationCode;
    
    @Positive(message = "Maliyet pozitif olmalıdır")
    private BigDecimal cost;
    
    @Positive(message = "Katılımcı sayısı pozitif olmalıdır")
    private Integer attendeeCount;
    
    private String specialRequirements;
    
    private VenueReservation.ReservationStatus status;
    
    private LocalDateTime approvalDate;
    
    private Long approvedById;
    
    private String approvedByName;
    
    private String rejectionReason;
    
    private Long createdById;
    
    private String createdByName;
    
    private LocalDateTime createdAt;
    
    private LocalDateTime updatedAt;
    
    private boolean isOverlapping;
} 