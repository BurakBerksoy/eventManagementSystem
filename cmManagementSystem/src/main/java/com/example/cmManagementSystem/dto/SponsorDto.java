package com.example.cmManagementSystem.dto;

import com.example.cmManagementSystem.entity.Sponsor;
import jakarta.validation.constraints.Email;
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
public class SponsorDto {
    
    private Long id;
    
    @NotBlank(message = "Sponsor adı zorunludur")
    private String name;
    
    private String description;
    
    private String logoUrl;
    
    private String websiteUrl;
    
    private String contactPerson;
    
    @Email(message = "Geçerli bir e-posta adresi giriniz")
    private String contactEmail;
    
    private String contactPhone;
    
    private String address;
    
    @NotNull(message = "Sponsor tipi zorunludur")
    private Sponsor.SponsorType type;
    
    @NotNull(message = "Sponsor seviyesi zorunludur")
    private Sponsor.SponsorLevel level;
    
    private LocalDateTime startDate;
    
    private LocalDateTime endDate;
    
    private Long createdById;
    
    private String createdByName;
    
    private List<Long> clubIds;
    
    private List<String> clubNames;
    
    private List<Long> eventIds;
    
    private List<String> eventNames;
    
    private LocalDateTime createdAt;
    
    private LocalDateTime updatedAt;
} 