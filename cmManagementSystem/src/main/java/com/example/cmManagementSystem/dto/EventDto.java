package com.example.cmManagementSystem.dto;

import com.example.cmManagementSystem.entity.Event;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
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
public class EventDto {
    
    private Long id;
    
    @NotBlank(message = "Etkinlik başlığı zorunludur")
    @Size(min = 3, max = 100, message = "Etkinlik başlığı 3-100 karakter arasında olmalıdır")
    private String title;
    
    private String description;
    
    @NotNull(message = "Başlangıç tarihi zorunludur")
    @Future(message = "Başlangıç tarihi gelecekte olmalıdır")
    private LocalDateTime startDate;
    
    @NotNull(message = "Bitiş tarihi zorunludur")
    @Future(message = "Bitiş tarihi gelecekte olmalıdır")
    private LocalDateTime endDate;
    
    @NotBlank(message = "Konum zorunludur")
    private String location;
    
    private Integer capacity;
    
    private String image;
    
    @NotBlank(message = "Kategori zorunludur")
    private String category;
    
    private Event.EventStatus status;
    
    private Long clubId;
    
    private String clubName;
    
    private Long createdById;
    
    private String createdByName;
    
    private boolean hasCertificate;
    
    private LocalDateTime createdAt;
    
    private LocalDateTime updatedAt;
    
    private Integer participantCount;
    
    private List<EventSpeakerDto> speakers;
    
    private List<EventProgramDto> programItems;
    
    private boolean isParticipating;
} 