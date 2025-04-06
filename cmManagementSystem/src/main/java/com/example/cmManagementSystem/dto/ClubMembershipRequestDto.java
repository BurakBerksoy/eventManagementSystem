package com.example.cmManagementSystem.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ClubMembershipRequestDto {
    
    private Long id;
    
    private Long clubId;
    
    private String clubName;
    
    private String clubLogo;
    
    private Long userId;
    
    private String userName;
    
    private String userProfileImage;
    
    private String status; // PENDING, APPROVED, REJECTED
    
    private String message; // Üyelik isteği ile ilgili mesaj
    
    private LocalDateTime requestDate;
    
    private LocalDateTime processDate; // Onay/red tarihi
    
    private String processedBy; // İşlemi yapan kullanıcı adı
    
    private Long processedById; // İşlemi yapan kullanıcı ID
} 