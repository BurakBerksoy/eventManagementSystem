package com.example.cmManagementSystem.controller;

import com.example.cmManagementSystem.dto.EventDto;
import com.example.cmManagementSystem.dto.EventSpeakerDto;
import com.example.cmManagementSystem.dto.EventProgramDto;
import com.example.cmManagementSystem.dto.CateringDto;
import com.example.cmManagementSystem.dto.WaitingListDto;
import com.example.cmManagementSystem.dto.VenueReservationDto;
import com.example.cmManagementSystem.dto.SurveyDto;
import com.example.cmManagementSystem.entity.Event;
import com.example.cmManagementSystem.service.EventService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/events")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class EventController {
    
    private final EventService eventService;
    
    @Autowired
    public EventController(EventService eventService) {
        this.eventService = eventService;
    }
    
    // Tüm etkinlikleri getir
    @GetMapping
    public ResponseEntity<List<EventDto>> getAllEvents(
            @RequestParam(required = false) Event.EventStatus status,
            @RequestParam(required = false) String category,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "startDate") String sort) {
        
        Pageable pageable = PageRequest.of(page, size, Sort.by(sort));
        List<EventDto> events;
        
        if (status != null) {
            events = eventService.findByStatus(status, pageable).getContent();
        } else if (category != null && !category.isEmpty()) {
            events = eventService.findByCategory(category, pageable).getContent();
        } else {
            events = eventService.findAll(pageable).getContent();
        }
        
        return ResponseEntity.ok(events);
    }
    
    // Etkinlik kategorilerini getir
    @GetMapping("/categories")
    public ResponseEntity<List<String>> getAllCategories() {
        List<String> categories = eventService.findAllCategories();
        return ResponseEntity.ok(categories);
    }
    
    // ID'ye göre etkinlik getir
    @GetMapping("/{id}")
    public ResponseEntity<EventDto> getEventById(@PathVariable Long id) {
        EventDto event = eventService.findById(id);
        return ResponseEntity.ok(event);
    }
    
    // Kulübe göre etkinlikleri getir
    @GetMapping("/club/{clubId}")
    public ResponseEntity<List<EventDto>> getEventsByClub(
            @PathVariable Long clubId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        Pageable pageable = PageRequest.of(page, size);
        List<EventDto> events = eventService.findByClubId(clubId, pageable).getContent();
        return ResponseEntity.ok(events);
    }
    
    // Kullanıcının katıldığı/kayıt olduğu etkinlikleri getir
    @GetMapping("/participation/user/{userId}")
    public ResponseEntity<List<EventDto>> getEventsByParticipant(@PathVariable Long userId) {
        List<EventDto> events = eventService.findEventsByParticipant(userId);
        return ResponseEntity.ok(events);
    }
    
    // Yeni etkinlik oluştur (ADMIN veya CLUB_PRESIDENT)
    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('CLUB_PRESIDENT')")
    public ResponseEntity<EventDto> createEvent(@RequestBody EventDto eventDto) {
        EventDto createdEvent = eventService.createEvent(eventDto);
        return ResponseEntity.ok(createdEvent);
    }
    
    // Etkinlik güncelle (ADMIN veya CLUB_PRESIDENT)
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or (hasRole('CLUB_PRESIDENT') and @eventAuthService.isEventCreatedByUser(authentication.principal, #id))")
    public ResponseEntity<EventDto> updateEvent(@PathVariable Long id, @RequestBody EventDto eventDto) {
        EventDto updatedEvent = eventService.updateEvent(id, eventDto);
        return ResponseEntity.ok(updatedEvent);
    }
    
    // Etkinlik sil (ADMIN veya CLUB_PRESIDENT)
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or (hasRole('CLUB_PRESIDENT') and @eventAuthService.isEventCreatedByUser(authentication.principal, #id))")
    public ResponseEntity<Void> deleteEvent(@PathVariable Long id) {
        eventService.deleteEvent(id);
        return ResponseEntity.noContent().build();
    }
    
    // Etkinlik durumunu güncelle (sadece ADMIN)
    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<EventDto> updateEventStatus(
            @PathVariable Long id,
            @RequestParam Event.EventStatus status) {
        EventDto updatedEvent = eventService.updateEventStatus(id, status);
        return ResponseEntity.ok(updatedEvent);
    }
    
    // Etkinliğe katılım (kayıt)
    @PostMapping("/{eventId}/register")
    public ResponseEntity<Void> registerForEvent(
            @PathVariable Long eventId,
            @RequestParam Long userId) {
        eventService.registerForEvent(eventId, userId);
        return ResponseEntity.ok().build();
    }
    
    // Etkinlik katılımını iptal et
    @DeleteMapping("/{eventId}/cancel")
    public ResponseEntity<Void> cancelEventRegistration(
            @PathVariable Long eventId,
            @RequestParam Long userId) {
        eventService.cancelRegistration(eventId, userId);
        return ResponseEntity.noContent().build();
    }
    
    // Konuşmacılar

    // Etkinliğe ait konuşmacıları getir
    @GetMapping("/{eventId}/speakers")
    public ResponseEntity<List<EventSpeakerDto>> getEventSpeakers(@PathVariable Long eventId) {
        return ResponseEntity.ok(eventService.getEventSpeakers(eventId));
    }
    
    // Konuşmacı ekle (ADMIN veya CLUB_PRESIDENT)
    @PostMapping("/{eventId}/speakers")
    @PreAuthorize("hasRole('ADMIN') or (hasRole('CLUB_PRESIDENT') and @eventAuthService.isEventCreatedByUser(authentication.principal, #eventId))")
    public ResponseEntity<EventSpeakerDto> addEventSpeaker(
            @PathVariable Long eventId,
            @Valid @RequestBody EventSpeakerDto speakerDto) {
        return new ResponseEntity<>(eventService.addEventSpeaker(eventId, speakerDto), HttpStatus.CREATED);
    }
    
    // Konuşmacı güncelle (ADMIN veya CLUB_PRESIDENT)
    @PutMapping("/{eventId}/speakers/{speakerId}")
    @PreAuthorize("hasRole('ADMIN') or (hasRole('CLUB_PRESIDENT') and @eventAuthService.isEventCreatedByUser(authentication.principal, #eventId))")
    public ResponseEntity<EventSpeakerDto> updateEventSpeaker(
            @PathVariable Long eventId,
            @PathVariable Long speakerId,
            @Valid @RequestBody EventSpeakerDto speakerDto) {
        return ResponseEntity.ok(eventService.updateEventSpeaker(eventId, speakerId, speakerDto));
    }
    
    // Konuşmacı sil (ADMIN veya CLUB_PRESIDENT)
    @DeleteMapping("/{eventId}/speakers/{speakerId}")
    @PreAuthorize("hasRole('ADMIN') or (hasRole('CLUB_PRESIDENT') and @eventAuthService.isEventCreatedByUser(authentication.principal, #eventId))")
    public ResponseEntity<Void> deleteEventSpeaker(
            @PathVariable Long eventId,
            @PathVariable Long speakerId) {
        eventService.deleteEventSpeaker(eventId, speakerId);
        return ResponseEntity.noContent().build();
    }
    
    // Program

    // Etkinlik programını getir
    @GetMapping("/{eventId}/program")
    public ResponseEntity<List<EventProgramDto>> getEventProgram(@PathVariable Long eventId) {
        return ResponseEntity.ok(eventService.getEventProgram(eventId));
    }
    
    // Program ekle (ADMIN veya CLUB_PRESIDENT)
    @PostMapping("/{eventId}/program")
    @PreAuthorize("hasRole('ADMIN') or (hasRole('CLUB_PRESIDENT') and @eventAuthService.isEventCreatedByUser(authentication.principal, #eventId))")
    public ResponseEntity<EventProgramDto> addEventProgram(
            @PathVariable Long eventId,
            @Valid @RequestBody EventProgramDto programDto) {
        return new ResponseEntity<>(eventService.addEventProgram(eventId, programDto), HttpStatus.CREATED);
    }
    
    // Program güncelle (ADMIN veya CLUB_PRESIDENT)
    @PutMapping("/{eventId}/program/{programId}")
    @PreAuthorize("hasRole('ADMIN') or (hasRole('CLUB_PRESIDENT') and @eventAuthService.isEventCreatedByUser(authentication.principal, #eventId))")
    public ResponseEntity<EventProgramDto> updateEventProgram(
            @PathVariable Long eventId,
            @PathVariable Long programId,
            @Valid @RequestBody EventProgramDto programDto) {
        return ResponseEntity.ok(eventService.updateEventProgram(eventId, programId, programDto));
    }
    
    // Program sil (ADMIN veya CLUB_PRESIDENT)
    @DeleteMapping("/{eventId}/program/{programId}")
    @PreAuthorize("hasRole('ADMIN') or (hasRole('CLUB_PRESIDENT') and @eventAuthService.isEventCreatedByUser(authentication.principal, #eventId))")
    public ResponseEntity<Void> deleteEventProgram(
            @PathVariable Long eventId,
            @PathVariable Long programId) {
        eventService.deleteEventProgram(eventId, programId);
        return ResponseEntity.noContent().build();
    }
    
    // İkram

    // Etkinlik ikramını getir
    @GetMapping("/{eventId}/catering")
    public ResponseEntity<CateringDto> getEventCatering(@PathVariable Long eventId) {
        return ResponseEntity.ok(eventService.getEventCatering(eventId));
    }
    
    // İkram ekle (ADMIN veya CLUB_PRESIDENT)
    @PostMapping("/{eventId}/catering")
    @PreAuthorize("hasRole('ADMIN') or (hasRole('CLUB_PRESIDENT') and @eventAuthService.isEventCreatedByUser(authentication.principal, #eventId))")
    public ResponseEntity<CateringDto> addEventCatering(
            @PathVariable Long eventId,
            @Valid @RequestBody CateringDto cateringDto) {
        return new ResponseEntity<>(eventService.addEventCatering(eventId, cateringDto), HttpStatus.CREATED);
    }
    
    // İkram güncelle (ADMIN veya CLUB_PRESIDENT)
    @PutMapping("/{eventId}/catering/{cateringId}")
    @PreAuthorize("hasRole('ADMIN') or (hasRole('CLUB_PRESIDENT') and @eventAuthService.isEventCreatedByUser(authentication.principal, #eventId))")
    public ResponseEntity<CateringDto> updateEventCatering(
            @PathVariable Long eventId,
            @PathVariable Long cateringId,
            @Valid @RequestBody CateringDto cateringDto) {
        return ResponseEntity.ok(eventService.updateEventCatering(eventId, cateringId, cateringDto));
    }
    
    // İkram sil (ADMIN veya CLUB_PRESIDENT)
    @DeleteMapping("/{eventId}/catering/{cateringId}")
    @PreAuthorize("hasRole('ADMIN') or (hasRole('CLUB_PRESIDENT') and @eventAuthService.isEventCreatedByUser(authentication.principal, #eventId))")
    public ResponseEntity<Void> deleteEventCatering(
            @PathVariable Long eventId,
            @PathVariable Long cateringId) {
        eventService.deleteEventCatering(eventId, cateringId);
        return ResponseEntity.noContent().build();
    }
    
    // Bekleme Listesi

    // Etkinlik bekleme listesini getir
    @GetMapping("/{eventId}/waiting-list")
    public ResponseEntity<List<WaitingListDto>> getEventWaitingList(@PathVariable Long eventId) {
        return ResponseEntity.ok(eventService.getWaitingList(eventId));
    }
    
    // Bekleme listesine ekle
    @PostMapping("/{eventId}/waiting-list")
    public ResponseEntity<WaitingListDto> addToWaitingList(
            @PathVariable Long eventId,
            @RequestParam Long userId) {
        return new ResponseEntity<>(eventService.addToWaitingList(eventId, userId), HttpStatus.CREATED);
    }
    
    // Bekleme listesinden çıkar
    @DeleteMapping("/{eventId}/waiting-list")
    public ResponseEntity<Void> removeFromWaitingList(
            @PathVariable Long eventId,
            @RequestParam Long userId) {
        eventService.removeFromWaitingList(eventId, userId);
        return ResponseEntity.noContent().build();
    }
    
    // Mekan Rezervasyonları

    // Etkinlik mekan rezervasyonlarını getir
    @GetMapping("/{eventId}/venue-reservations")
    @PreAuthorize("hasRole('ADMIN') or (hasRole('CLUB_PRESIDENT') and @eventAuthService.isEventCreatedByUser(authentication.principal, #eventId))")
    public ResponseEntity<List<VenueReservationDto>> getVenueReservations(@PathVariable Long eventId) {
        return ResponseEntity.ok(eventService.getVenueReservations(eventId));
    }
    
    // Anketler

    // Etkinlik anketlerini getir
    @GetMapping("/{eventId}/surveys")
    public ResponseEntity<List<SurveyDto>> getEventSurveys(@PathVariable Long eventId) {
        return ResponseEntity.ok(eventService.getEventSurveys(eventId));
    }
    
    // Anket detaylarını getir
    @GetMapping("/{eventId}/surveys/{surveyId}")
    public ResponseEntity<SurveyDto> getSurveyDetails(
            @PathVariable Long eventId,
            @PathVariable Long surveyId) {
        return ResponseEntity.ok(eventService.getSurveyDetails(eventId, surveyId));
    }
} 