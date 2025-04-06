package com.example.cmManagementSystem.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ClubMembershipDto {
    
    private Long id;
    
    private Long clubId;
    
    private String clubName;
    
    private String clubLogo;
    
    private Long userId;
    
    private String userName;
    
    @NotBlank(message = "Rol zorunludur")
    private String role;
    
    private LocalDateTime joinDate;
    
    private LocalDateTime leaveDate;
    
    private boolean active;
    
    private String responsibilities;
    
    private boolean isMember;
    
    private boolean isPending;
} 