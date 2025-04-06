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
public class NotificationDto {
    
    private Long id;
    
    private String title;
    
    private String message;
    
    private String type; // CLUB, EVENT, SYSTEM, CLUB_MEMBERSHIP_REQUEST, etc.
    
    private Long userId;
    
    private Long entityId; // İlgili entity ID (kulüp, etkinlik vb.)
    
    private String entityName; // İlgili entity adı (kulüp adı, etkinlik adı vb.)
    
    private boolean isRead;
    
    private LocalDateTime createdAt;
    
    private LocalDateTime readAt;
    
    private String data; // JSON formatında ek veri (gerekirse)
    
    private String actionUrl; // Bildirime tıklandığında yönlendirilecek URL
} 