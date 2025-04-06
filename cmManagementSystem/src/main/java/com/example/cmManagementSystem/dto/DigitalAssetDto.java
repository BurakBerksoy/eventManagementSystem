package com.example.cmManagementSystem.dto;

import com.example.cmManagementSystem.entity.DigitalAsset;
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
public class DigitalAssetDto {
    
    private Long id;
    
    @NotBlank(message = "Başlık zorunludur")
    private String title;
    
    private String description;
    
    @NotBlank(message = "Dosya URL'i zorunludur")
    private String fileUrl;
    
    private String thumbnailUrl;
    
    @NotBlank(message = "Dosya tipi zorunludur")
    private String fileType;
    
    private Long fileSize;
    
    private String originalFilename;
    
    @NotNull(message = "Varlık tipi zorunludur")
    private DigitalAsset.AssetType type;
    
    @NotNull(message = "Varlık kategorisi zorunludur")
    private DigitalAsset.AssetCategory category;
    
    private Long clubId;
    
    private String clubName;
    
    private Long eventId;
    
    private String eventTitle;
    
    private Boolean isPublic;
    
    private String tags;
    
    @NotNull(message = "Oluşturan ID zorunludur")
    private Long createdById;
    
    private String createdByName;
    
    private LocalDateTime createdAt;
    
    private LocalDateTime updatedAt;
} 