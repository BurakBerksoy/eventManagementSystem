package com.example.cmManagementSystem.dto;

import jakarta.validation.constraints.Email;
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
public class EventSpeakerDto {
    
    private Long id;
    
    @NotNull(message = "Etkinlik ID zorunludur")
    private Long eventId;
    
    private String eventTitle;
    
    @NotBlank(message = "Konuşmacı adı zorunludur")
    private String name;
    
    private String title;
    
    private String organization;
    
    private String bio;
    
    private String topic;
    
    private String imageUrl;
    
    @Email(message = "Geçerli bir e-posta adresi giriniz")
    private String email;
    
    private String phone;
    
    private Integer orderIndex;
    
    private boolean featured;
    
    private LocalDateTime createdAt;
    
    private LocalDateTime updatedAt;
} 