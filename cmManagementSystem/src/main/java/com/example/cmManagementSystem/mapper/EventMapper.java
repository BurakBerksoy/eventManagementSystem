package com.example.cmManagementSystem.mapper;

import com.example.cmManagementSystem.dto.EventDto;
import com.example.cmManagementSystem.entity.Event;
import com.example.cmManagementSystem.repository.EventParticipationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class EventMapper {
    
    private final EventParticipationRepository eventParticipationRepository;
    
    @Autowired
    public EventMapper(EventParticipationRepository eventParticipationRepository) {
        this.eventParticipationRepository = eventParticipationRepository;
    }
    
    /**
     * Event entity'sini EventDto'ya dönüştürür
     *
     * @param event Event entity
     * @return EventDto
     */
    public EventDto toDto(Event event) {
        if (event == null) {
            return null;
        }
        
        int participantCount = eventParticipationRepository.countParticipantsByEventId(event.getId());
        
        return EventDto.builder()
                .id(event.getId())
                .title(event.getTitle())
                .description(event.getDescription())
                .startDate(event.getStartDate())
                .endDate(event.getEndDate())
                .location(event.getLocation())
                .capacity(event.getCapacity())
                .image(event.getImage())
                .category(event.getCategory())
                .status(event.getStatus())
                .clubId(event.getClub() != null ? event.getClub().getId() : null)
                .clubName(event.getClub() != null ? event.getClub().getName() : null)
                .createdById(event.getCreatedBy() != null ? event.getCreatedBy().getId() : null)
                .createdByName(event.getCreatedBy() != null ? event.getCreatedBy().getName() : null)
                .createdAt(event.getCreatedAt())
                .updatedAt(event.getUpdatedAt())
                .participantCount(participantCount)
                .build();
    }
    
    /**
     * EventDto'yu Event entity'ye dönüştürür (yeni entity oluşturur)
     *
     * @param eventDto EventDto
     * @return Event entity
     */
    public Event toEntity(EventDto eventDto) {
        if (eventDto == null) {
            return null;
        }
        
        return Event.builder()
                .id(eventDto.getId())
                .title(eventDto.getTitle())
                .description(eventDto.getDescription())
                .startDate(eventDto.getStartDate())
                .endDate(eventDto.getEndDate())
                .location(eventDto.getLocation())
                .capacity(eventDto.getCapacity())
                .image(eventDto.getImage())
                .category(eventDto.getCategory())
                .status(eventDto.getStatus() != null ? eventDto.getStatus() : Event.EventStatus.PENDING)
                .createdAt(eventDto.getCreatedAt())
                .updatedAt(eventDto.getUpdatedAt())
                .build();
    }
    
    /**
     * EventDto değerlerini mevcut Event entity'sine kopyalar (update)
     *
     * @param eventDto Kaynak EventDto
     * @param event Hedef Event entity
     */
    public void updateEntityFromDto(EventDto eventDto, Event event) {
        if (eventDto == null || event == null) {
            return;
        }
        
        if (eventDto.getTitle() != null) {
            event.setTitle(eventDto.getTitle());
        }
        
        if (eventDto.getDescription() != null) {
            event.setDescription(eventDto.getDescription());
        }
        
        if (eventDto.getStartDate() != null) {
            event.setStartDate(eventDto.getStartDate());
        }
        
        if (eventDto.getEndDate() != null) {
            event.setEndDate(eventDto.getEndDate());
        }
        
        if (eventDto.getLocation() != null) {
            event.setLocation(eventDto.getLocation());
        }
        
        if (eventDto.getCapacity() != null) {
            event.setCapacity(eventDto.getCapacity());
        }
        
        if (eventDto.getImage() != null) {
            event.setImage(eventDto.getImage());
        }
        
        if (eventDto.getCategory() != null) {
            event.setCategory(eventDto.getCategory());
        }
        
        if (eventDto.getStatus() != null) {
            event.setStatus(eventDto.getStatus());
        }
    }
} 