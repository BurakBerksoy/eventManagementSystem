package com.example.cmManagementSystem.dto;

import com.example.cmManagementSystem.entity.WaitingList;
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
public class WaitingListDto {
    
    private Long id;
    
    @NotNull(message = "Etkinlik ID zorunludur")
    private Long eventId;
    
    private String eventTitle;
    
    @NotNull(message = "Kullanıcı ID zorunludur")
    private Long userId;
    
    private String userName;
    
    private String userEmail;
    
    private LocalDateTime joinDate;
    
    private Integer position;
    
    private Boolean notificationSent;
    
    private LocalDateTime notificationDate;
    
    private WaitingList.WaitingStatus status;
    
    private LocalDateTime responseDeadline;
    
    private LocalDateTime responseDate;
    
    private String notes;
    
    private LocalDateTime createdAt;
    
    private LocalDateTime updatedAt;
} 