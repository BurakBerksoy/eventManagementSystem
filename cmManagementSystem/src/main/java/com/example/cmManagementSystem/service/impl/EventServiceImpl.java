package com.example.cmManagementSystem.service.impl;

import com.example.cmManagementSystem.dto.CateringDto;
import com.example.cmManagementSystem.dto.EventDto;
import com.example.cmManagementSystem.dto.EventProgramDto;
import com.example.cmManagementSystem.dto.EventSpeakerDto;
import com.example.cmManagementSystem.dto.SurveyDto;
import com.example.cmManagementSystem.dto.VenueReservationDto;
import com.example.cmManagementSystem.dto.WaitingListDto;
import com.example.cmManagementSystem.entity.Club;
import com.example.cmManagementSystem.entity.Event;
import com.example.cmManagementSystem.entity.EventParticipation;
import com.example.cmManagementSystem.entity.User;
import com.example.cmManagementSystem.mapper.EventMapper;
import com.example.cmManagementSystem.repository.ClubRepository;
import com.example.cmManagementSystem.repository.EventParticipationRepository;
import com.example.cmManagementSystem.repository.EventRepository;
import com.example.cmManagementSystem.repository.UserRepository;
import com.example.cmManagementSystem.service.EventService;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class EventServiceImpl implements EventService {
    
    private final EventRepository eventRepository;
    private final ClubRepository clubRepository;
    private final UserRepository userRepository;
    private final EventParticipationRepository participationRepository;
    private final EventMapper eventMapper;
    
    @Autowired
    public EventServiceImpl(
            EventRepository eventRepository,
            ClubRepository clubRepository,
            UserRepository userRepository,
            EventParticipationRepository participationRepository,
            EventMapper eventMapper) {
        this.eventRepository = eventRepository;
        this.clubRepository = clubRepository;
        this.userRepository = userRepository;
        this.participationRepository = participationRepository;
        this.eventMapper = eventMapper;
    }
    
    @Override
    public Page<EventDto> findAll(Pageable pageable) {
        return eventRepository.findAll(pageable)
                .map(eventMapper::toDto);
    }
    
    @Override
    public EventDto findById(Long id) {
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Etkinlik bulunamadı: " + id));
        return eventMapper.toDto(event);
    }
    
    @Override
    public Page<EventDto> findByStatus(Event.EventStatus status, Pageable pageable) {
        return eventRepository.findByStatus(status, pageable)
                .map(eventMapper::toDto);
    }
    
    @Override
    public Page<EventDto> findByCategory(String category, Pageable pageable) {
        return eventRepository.findByCategory(category, pageable)
                .map(eventMapper::toDto);
    }
    
    @Override
    public Page<EventDto> findByClubId(Long clubId, Pageable pageable) {
        return eventRepository.findByClubId(clubId, pageable)
                .map(eventMapper::toDto);
    }
    
    @Override
    @Transactional
    public EventDto createEvent(EventDto eventDto) {
        Event event = eventMapper.toEntity(eventDto);
        
        // Kulüp kontrolü
        if (eventDto.getClubId() != null) {
            Club club = clubRepository.findById(eventDto.getClubId())
                    .orElseThrow(() -> new EntityNotFoundException("Kulüp bulunamadı: " + eventDto.getClubId()));
            event.setClub(club);
        }
        
        // Oluşturan kullanıcı kontrolü
        if (eventDto.getCreatedById() != null) {
            User createdBy = userRepository.findById(eventDto.getCreatedById())
                    .orElseThrow(() -> new EntityNotFoundException("Kullanıcı bulunamadı: " + eventDto.getCreatedById()));
            event.setCreatedBy(createdBy);
        }
        
        // Varsayılan status PENDING olarak ayarlanır
        if (event.getStatus() == null) {
            event.setStatus(Event.EventStatus.PENDING);
        }
        
        event = eventRepository.save(event);
        return eventMapper.toDto(event);
    }
    
    @Override
    @Transactional
    public EventDto updateEvent(Long id, EventDto eventDto) {
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Etkinlik bulunamadı: " + id));
        
        eventMapper.updateEntityFromDto(eventDto, event);
        
        // Kulüp güncellemesi gerekiyorsa
        if (eventDto.getClubId() != null && 
                (event.getClub() == null || !event.getClub().getId().equals(eventDto.getClubId()))) {
            Club club = clubRepository.findById(eventDto.getClubId())
                    .orElseThrow(() -> new EntityNotFoundException("Kulüp bulunamadı: " + eventDto.getClubId()));
            event.setClub(club);
        }
        
        event = eventRepository.save(event);
        return eventMapper.toDto(event);
    }
    
    @Override
    @Transactional
    public void deleteEvent(Long id) {
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Etkinlik bulunamadı: " + id));
        
        // Katılımları sil
        participationRepository.findByEventId(id)
                .forEach(participationRepository::delete);
        
        // Etkinliği sil
        eventRepository.delete(event);
    }
    
    @Override
    @Transactional
    public EventDto updateEventStatus(Long id, Event.EventStatus status) {
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Etkinlik bulunamadı: " + id));
        
        event.setStatus(status);
        event = eventRepository.save(event);
        
        return eventMapper.toDto(event);
    }
    
    @Override
    @Transactional
    public void registerForEvent(Long eventId, Long userId) {
        // Etkinlik kontrolü
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new EntityNotFoundException("Etkinlik bulunamadı: " + eventId));
        
        // Kullanıcı kontrolü
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("Kullanıcı bulunamadı: " + userId));
        
        // Mevcut katılım kontrolü
        Optional<EventParticipation> existingParticipation = 
                participationRepository.findByEventIdAndUserId(eventId, userId);
        
        if (existingParticipation.isPresent()) {
            // Katılım zaten varsa, iptal edildiyse tekrar aktifleştir
            EventParticipation participation = existingParticipation.get();
            if (participation.getStatus() == EventParticipation.ParticipationStatus.CANCELLED) {
                participation.setStatus(EventParticipation.ParticipationStatus.REGISTERED);
                participation.setCancellationDate(null);
                participation.setCancellationReason(null);
                participationRepository.save(participation);
            }
            // Zaten aktif bir katılım varsa bir şey yapma
        } else {
            // Yeni katılım oluştur
            EventParticipation participation = EventParticipation.builder()
                    .event(event)
                    .user(user)
                    .status(EventParticipation.ParticipationStatus.REGISTERED)
                    .registrationDate(LocalDateTime.now())
                    .build();
            participationRepository.save(participation);
        }
    }
    
    @Override
    @Transactional
    public void cancelRegistration(Long eventId, Long userId) {
        // Katılım kontrolü
        EventParticipation participation = participationRepository.findByEventIdAndUserId(eventId, userId)
                .orElseThrow(() -> new EntityNotFoundException("Etkinlik katılımı bulunamadı"));
        
        // Katılımı iptal et
        participation.setStatus(EventParticipation.ParticipationStatus.CANCELLED);
        participation.setCancellationDate(LocalDateTime.now());
        participationRepository.save(participation);
    }
    
    @Override
    public List<String> findAllCategories() {
        // Bu metod tüm benzersiz kategorileri veritabanından çeker
        List<String> categories = new ArrayList<>();
        eventRepository.findAll().forEach(event -> {
            if (event.getCategory() != null && !event.getCategory().isEmpty()) {
                categories.add(event.getCategory());
            }
        });
        
        // Benzersiz kategorileri dön
        return categories.stream().distinct().collect(Collectors.toList());
    }
    
    @Override
    public List<EventDto> findEventsByParticipant(Long userId) {
        // Kullanıcı kontrolü
        if (!userRepository.existsById(userId)) {
            throw new EntityNotFoundException("Kullanıcı bulunamadı: " + userId);
        }
        
        // Kullanıcının katıldığı etkinlikleri bul
        List<EventParticipation> participations = participationRepository.findByUserIdAndStatus(
                userId, EventParticipation.ParticipationStatus.REGISTERED);
        
        // DTO'ya dönüştür
        return participations.stream()
                .map(participation -> eventMapper.toDto(participation.getEvent()))
                .collect(Collectors.toList());
    }
    
    @Override
    public List<SurveyDto> getEventSurveys(Long eventId) {
        // Etkinlik kontrolü
        if (!eventRepository.existsById(eventId)) {
            throw new EntityNotFoundException("Etkinlik bulunamadı: " + eventId);
        }
        
        // Bu metod şu an için boş bir liste dönüyor, daha sonra implement edilecek
        return new ArrayList<>();
    }
    
    @Override
    public SurveyDto getSurveyDetails(Long eventId, Long surveyId) {
        // Etkinlik kontrolü
        if (!eventRepository.existsById(eventId)) {
            throw new EntityNotFoundException("Etkinlik bulunamadı: " + eventId);
        }
        
        // Bu metod şu an için null dönüyor, daha sonra implement edilecek
        return null;
    }
    
    @Override
    public List<VenueReservationDto> getVenueReservations(Long eventId) {
        // Etkinlik kontrolü
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new EntityNotFoundException("Etkinlik bulunamadı: " + eventId));
        
        // Bu metod şu an için boş bir liste dönüyor, daha sonra implement edilecek
        return new ArrayList<>();
    }
    
    @Override
    public void removeFromWaitingList(Long eventId, Long userId) {
        // Etkinlik kontrolü
        if (!eventRepository.existsById(eventId)) {
            throw new EntityNotFoundException("Etkinlik bulunamadı: " + eventId);
        }
        
        // Kullanıcı kontrolü
        if (!userRepository.existsById(userId)) {
            throw new EntityNotFoundException("Kullanıcı bulunamadı: " + userId);
        }
        
        // Bu metod şu an için sadece kontrolleri yapıyor, daha sonra implement edilecek
        // Gerçek uygulamada bekleme listesinden kullanıcıyı çıkarma işlemi yapılacak
    }
    
    @Override
    public List<EventSpeakerDto> getEventSpeakers(Long eventId) {
        // Etkinlik kontrolü
        if (!eventRepository.existsById(eventId)) {
            throw new EntityNotFoundException("Etkinlik bulunamadı: " + eventId);
        }
        
        // Bu metod şu an için boş bir liste dönüyor, daha sonra implement edilecek
        return new ArrayList<>();
    }
    
    @Override
    public EventSpeakerDto addEventSpeaker(Long eventId, EventSpeakerDto speakerDto) {
        // Etkinlik kontrolü
        if (!eventRepository.existsById(eventId)) {
            throw new EntityNotFoundException("Etkinlik bulunamadı: " + eventId);
        }
        
        // Bu metod şu an için null dönüyor, daha sonra implement edilecek
        return null;
    }
    
    @Override
    public EventSpeakerDto updateEventSpeaker(Long eventId, Long speakerId, EventSpeakerDto speakerDto) {
        // Etkinlik kontrolü
        if (!eventRepository.existsById(eventId)) {
            throw new EntityNotFoundException("Etkinlik bulunamadı: " + eventId);
        }
        
        // Bu metod şu an için null dönüyor, daha sonra implement edilecek
        return null;
    }
    
    @Override
    public void deleteEventSpeaker(Long eventId, Long speakerId) {
        // Etkinlik kontrolü
        if (!eventRepository.existsById(eventId)) {
            throw new EntityNotFoundException("Etkinlik bulunamadı: " + eventId);
        }
        
        // Bu metod şu an için sadece kontrolleri yapıyor, daha sonra implement edilecek
    }
    
    @Override
    public List<EventProgramDto> getEventProgram(Long eventId) {
        // Etkinlik kontrolü
        if (!eventRepository.existsById(eventId)) {
            throw new EntityNotFoundException("Etkinlik bulunamadı: " + eventId);
        }
        
        // Bu metod şu an için boş bir liste dönüyor, daha sonra implement edilecek
        return new ArrayList<>();
    }
    
    @Override
    public EventProgramDto addEventProgram(Long eventId, EventProgramDto programDto) {
        // Etkinlik kontrolü
        if (!eventRepository.existsById(eventId)) {
            throw new EntityNotFoundException("Etkinlik bulunamadı: " + eventId);
        }
        
        // Bu metod şu an için null dönüyor, daha sonra implement edilecek
        return null;
    }
    
    @Override
    public EventProgramDto updateEventProgram(Long eventId, Long programId, EventProgramDto programDto) {
        // Etkinlik kontrolü
        if (!eventRepository.existsById(eventId)) {
            throw new EntityNotFoundException("Etkinlik bulunamadı: " + eventId);
        }
        
        // Bu metod şu an için null dönüyor, daha sonra implement edilecek
        return null;
    }
    
    @Override
    public void deleteEventProgram(Long eventId, Long programId) {
        // Etkinlik kontrolü
        if (!eventRepository.existsById(eventId)) {
            throw new EntityNotFoundException("Etkinlik bulunamadı: " + eventId);
        }
        
        // Bu metod şu an için sadece kontrolleri yapıyor, daha sonra implement edilecek
    }
    
    @Override
    public CateringDto getEventCatering(Long eventId) {
        // Etkinlik kontrolü
        if (!eventRepository.existsById(eventId)) {
            throw new EntityNotFoundException("Etkinlik bulunamadı: " + eventId);
        }
        
        // Bu metod şu an için null dönüyor, daha sonra implement edilecek
        return null;
    }
    
    @Override
    public CateringDto addEventCatering(Long eventId, CateringDto cateringDto) {
        // Etkinlik kontrolü
        if (!eventRepository.existsById(eventId)) {
            throw new EntityNotFoundException("Etkinlik bulunamadı: " + eventId);
        }
        
        // Bu metod şu an için null dönüyor, daha sonra implement edilecek
        return null;
    }
    
    @Override
    public CateringDto updateEventCatering(Long eventId, Long cateringId, CateringDto cateringDto) {
        // Etkinlik kontrolü
        if (!eventRepository.existsById(eventId)) {
            throw new EntityNotFoundException("Etkinlik bulunamadı: " + eventId);
        }
        
        // Bu metod şu an için null dönüyor, daha sonra implement edilecek
        return null;
    }
    
    @Override
    public void deleteEventCatering(Long eventId, Long cateringId) {
        // Etkinlik kontrolü
        if (!eventRepository.existsById(eventId)) {
            throw new EntityNotFoundException("Etkinlik bulunamadı: " + eventId);
        }
        
        // Bu metod şu an için sadece kontrolleri yapıyor, daha sonra implement edilecek
    }
    
    @Override
    public List<WaitingListDto> getWaitingList(Long eventId) {
        // Etkinlik kontrolü
        if (!eventRepository.existsById(eventId)) {
            throw new EntityNotFoundException("Etkinlik bulunamadı: " + eventId);
        }
        
        // Bu metod şu an için boş bir liste dönüyor, daha sonra implement edilecek
        return new ArrayList<>();
    }
    
    @Override
    public WaitingListDto addToWaitingList(Long eventId, Long userId) {
        // Etkinlik kontrolü
        if (!eventRepository.existsById(eventId)) {
            throw new EntityNotFoundException("Etkinlik bulunamadı: " + eventId);
        }
        
        // Kullanıcı kontrolü
        if (!userRepository.existsById(userId)) {
            throw new EntityNotFoundException("Kullanıcı bulunamadı: " + userId);
        }
        
        // Bu metod şu an için null dönüyor, daha sonra implement edilecek
        return null;
    }
} 