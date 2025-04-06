package com.example.cmManagementSystem.dto;

import com.example.cmManagementSystem.entity.EventProgram;
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
public class EventProgramDto {
    
    private Long id;
    
    @NotNull(message = "Etkinlik ID zorunludur")
    private Long eventId;
    
    private String eventTitle;
    
    @NotBlank(message = "Başlık zorunludur")
    private String title;
    
    private String description;
    
    @NotNull(message = "Başlangıç zamanı zorunludur")
    private LocalDateTime startTime;
    
    @NotNull(message = "Bitiş zamanı zorunludur")
    private LocalDateTime endTime;
    
    private String location;
    
    private Integer orderIndex;
    
    private String speakerName;
    
    private Long speakerId;
    
    private EventSpeakerDto speaker;
    
    @NotNull(message = "Program tipi zorunludur")
    private EventProgram.ProgramType type;
    
    private LocalDateTime createdAt;
    
    private LocalDateTime updatedAt;
} 