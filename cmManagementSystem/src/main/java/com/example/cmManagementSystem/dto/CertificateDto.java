package com.example.cmManagementSystem.dto;

import com.example.cmManagementSystem.entity.Certificate;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CertificateDto {
    
    private Long id;
    
    private Long eventId;
    
    private String eventTitle;
    
    private Long userId;
    
    private String userName;
    
    private String code;
    
    private LocalDateTime createdDate;
    
    private LocalDateTime expiryDate;
    
    private Certificate.Status status;
    
    private String pdfPath;
    
    private String verificationUrl;
} 