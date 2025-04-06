package com.example.cmManagementSystem.dto;

import com.example.cmManagementSystem.entity.Club;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ClubDto {
    
    private Long id;
    
    @NotBlank(message = "Kulüp adı zorunludur")
    @Size(min = 3, max = 100, message = "Kulüp adı 3-100 karakter arasında olmalıdır")
    private String name;
    
    private String description;
    
    private String logo;
    
    private String bannerImage;
    
    private Integer foundationYear;
    
    private Club.ClubStatus status;
    
    private Long presidentId;
    
    private String presidentName;
    
    private String contactEmail;
    
    private String contactPhone;
    
    private String category;
    
    private LocalDateTime createdAt;
    
    private LocalDateTime updatedAt;
    
    private String about;
    
    private String instagramLink;
    
    private String twitterLink;
    
    private String linkedinLink;
    
    private Integer memberCount;
    
    private Integer eventCount;
    
    private Integer activeEventCount;
    
    private String contact;
    
    private LocalDateTime foundationDate;
    
    private boolean active;
    
    private int membersCount;
    
    private Integer maxMembers;
} 