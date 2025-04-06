package com.example.cmManagementSystem.service.impl;

import com.example.cmManagementSystem.entity.Event;
import com.example.cmManagementSystem.entity.EventParticipation;
import com.example.cmManagementSystem.repository.EventParticipationRepository;
import com.example.cmManagementSystem.repository.EventRepository;
import com.example.cmManagementSystem.service.ClubAuthService;
import com.example.cmManagementSystem.service.EventAuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class EventAuthServiceImpl implements EventAuthService {
    
    private final EventRepository eventRepository;
    private final EventParticipationRepository eventParticipationRepository;
    private final ClubAuthService clubAuthService;
    
    @Autowired
    public EventAuthServiceImpl(
            EventRepository eventRepository,
            EventParticipationRepository eventParticipationRepository,
            ClubAuthService clubAuthService) {
        this.eventRepository = eventRepository;
        this.eventParticipationRepository = eventParticipationRepository;
        this.clubAuthService = clubAuthService;
    }
    
    /**
     * Kullanıcının belirtilen etkinliği oluşturan kişi olup olmadığını kontrol eder
     *
     * @param userId Kullanıcı ID
     * @param eventId Etkinlik ID
     * @return Kullanıcı bu etkinliği oluşturan kişi mi
     */
    @Override
    public boolean isEventCreatedByUser(Long userId, Long eventId) {
        if (userId == null || eventId == null) {
            return false;
        }
        
        Optional<Event> eventOpt = eventRepository.findById(eventId);
        
        if (eventOpt.isEmpty() || eventOpt.get().getCreatedBy() == null) {
            return false;
        }
        
        return eventOpt.get().getCreatedBy().getId().equals(userId);
    }
    
    /**
     * Kullanıcının belirtilen etkinliğe katılımcı olup olmadığını kontrol eder
     *
     * @param userId Kullanıcı ID
     * @param eventId Etkinlik ID
     * @return Kullanıcı bu etkinliğin katılımcısı mı
     */
    @Override
    public boolean isEventParticipant(Long userId, Long eventId) {
        if (userId == null || eventId == null) {
            return false;
        }
        
        Optional<EventParticipation> participation = eventParticipationRepository.findByEventIdAndUserId(eventId, userId);
        return participation.isPresent() && participation.get().getStatus() == EventParticipation.ParticipationStatus.REGISTERED;
    }
    
    /**
     * Kullanıcının belirtilen etkinliğin düzenleyicisi olan kulübün başkanı olup olmadığını kontrol eder
     *
     * @param userId Kullanıcı ID
     * @param eventId Etkinlik ID
     * @return Kullanıcı bu etkinliği düzenleyen kulübün başkanı mı
     */
    @Override
    public boolean isEventOrganizedByUsersClub(Long userId, Long eventId) {
        if (userId == null || eventId == null) {
            return false;
        }
        
        Optional<Event> eventOpt = eventRepository.findById(eventId);
        if (!eventOpt.isPresent() || eventOpt.get().getClub() == null) {
            return false;
        }
        
        Long clubId = eventOpt.get().getClub().getId();
        return clubAuthService.isPresidentOfClub(userId, clubId);
    }
} 