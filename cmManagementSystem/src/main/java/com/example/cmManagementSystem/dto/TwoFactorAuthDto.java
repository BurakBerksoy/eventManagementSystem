package com.example.cmManagementSystem.dto;

import com.example.cmManagementSystem.entity.TwoFactorAuth;
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
public class TwoFactorAuthDto {
    
    private Long id;
    
    @NotNull(message = "Kullanıcı ID zorunludur")
    private Long userId;
    
    private String userEmail;
    
    private Boolean isEnabled;
    
    private TwoFactorAuth.AuthMethod method;
    
    private String phoneNumber;
    
    private LocalDateTime lastUsed;
    
    // Güvenlik nedeniyle client'a gönderilmez
    private String secretKey;
    
    // Güvenlik nedeniyle client'a gönderilmez
    private String backupCodes;
    
    private LocalDateTime createdAt;
    
    private LocalDateTime updatedAt;
    
    // QR kod oluşturma için
    private String qrCodeUrl;
} 