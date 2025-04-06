package com.example.cmManagementSystem.service.impl;

import com.example.cmManagementSystem.dto.VenueDto;
import com.example.cmManagementSystem.dto.VenueReservationDto;
import com.example.cmManagementSystem.entity.Club;
import com.example.cmManagementSystem.entity.ClubMembership;
import com.example.cmManagementSystem.entity.Event;
import com.example.cmManagementSystem.entity.User;
import com.example.cmManagementSystem.entity.Venue;
import com.example.cmManagementSystem.entity.VenueReservation;
import com.example.cmManagementSystem.exception.ResourceNotFoundException;
import com.example.cmManagementSystem.repository.ClubMembershipRepository;
import com.example.cmManagementSystem.repository.ClubRepository;
import com.example.cmManagementSystem.repository.EventRepository;
import com.example.cmManagementSystem.repository.UserRepository;
import com.example.cmManagementSystem.repository.VenueRepository;
import com.example.cmManagementSystem.repository.VenueReservationRepository;
import com.example.cmManagementSystem.service.VenueService;
import lombok.extern.slf4j.Slf4j;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Slf4j
@Transactional
public class VenueServiceImpl implements VenueService {
    
    private final VenueRepository venueRepository;
    private final VenueReservationRepository reservationRepository;
    private final UserRepository userRepository;
    private final ClubRepository clubRepository;
    private final ClubMembershipRepository clubMembershipRepository;
    private final EventRepository eventRepository;
    private final ModelMapper modelMapper;
    
    @Autowired
    public VenueServiceImpl(
            VenueRepository venueRepository,
            VenueReservationRepository reservationRepository,
            UserRepository userRepository,
            ClubRepository clubRepository,
            ClubMembershipRepository clubMembershipRepository,
            EventRepository eventRepository,
            ModelMapper modelMapper) {
        this.venueRepository = venueRepository;
        this.reservationRepository = reservationRepository;
        this.userRepository = userRepository;
        this.clubRepository = clubRepository;
        this.clubMembershipRepository = clubMembershipRepository;
        this.eventRepository = eventRepository;
        this.modelMapper = modelMapper;
    }
    
    @Override
    public List<VenueDto> findAll() {
        List<Venue> venues = venueRepository.findAll();
        return venues.stream()
                .map(this::mapToVenueDto)
                .collect(Collectors.toList());
    }
    
    @Override
    public VenueDto findById(Long id) {
        Venue venue = venueRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Venue", "id", id));
        return mapToVenueDto(venue);
    }
    
    @Override
    @Transactional
    public VenueDto createVenue(VenueDto venueDto) {
        Venue venue = new Venue();
        
        // Temel bilgileri ayarla
        venue.setName(venueDto.getName());
        venue.setDescription(venueDto.getDescription());
        venue.setAddress(venueDto.getAddress());
        venue.setCity(venueDto.getCity());
        venue.setDistrict(venueDto.getDistrict());
        venue.setPostalCode(venueDto.getPostalCode());
        venue.setCountry(venueDto.getCountry());
        venue.setLatitude(venueDto.getLatitude());
        venue.setLongitude(venueDto.getLongitude());
        venue.setCapacity(venueDto.getCapacity());
        venue.setContactPerson(venueDto.getContactPerson());
        venue.setContactEmail(venueDto.getContactEmail());
        venue.setContactPhone(venueDto.getContactPhone());
        venue.setRentalFee(venueDto.getRentalFee());
        venue.setIsUniversityVenue(venueDto.getIsUniversityVenue());
        venue.setEquipmentInfo(venueDto.getEquipmentInfo());
        venue.setAccessibilityInfo(venueDto.getAccessibilityInfo());
        venue.setImageUrl(venueDto.getImageUrl());
        venue.setAvailableTimes(venueDto.getAvailableTimes());
        
        // Oluşturan kullanıcıyı ayarla (varsa)
        if (venueDto.getCreatedById() != null) {
            User createdBy = userRepository.findById(venueDto.getCreatedById())
                    .orElseThrow(() -> new ResourceNotFoundException("User", "id", venueDto.getCreatedById()));
            venue.setCreatedBy(createdBy);
        }
        
        // Mekanı kaydet
        Venue savedVenue = venueRepository.save(venue);
        
        return mapToVenueDto(savedVenue);
    }
    
    @Override
    @Transactional
    public VenueDto updateVenue(Long id, VenueDto venueDto) {
        Venue venue = venueRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Venue", "id", id));
        
        // Güncelleme işlemleri
        venue.setName(venueDto.getName());
        venue.setDescription(venueDto.getDescription());
        venue.setAddress(venueDto.getAddress());
        venue.setCity(venueDto.getCity());
        venue.setDistrict(venueDto.getDistrict());
        venue.setPostalCode(venueDto.getPostalCode());
        venue.setCountry(venueDto.getCountry());
        venue.setLatitude(venueDto.getLatitude());
        venue.setLongitude(venueDto.getLongitude());
        venue.setCapacity(venueDto.getCapacity());
        venue.setContactPerson(venueDto.getContactPerson());
        venue.setContactEmail(venueDto.getContactEmail());
        venue.setContactPhone(venueDto.getContactPhone());
        venue.setRentalFee(venueDto.getRentalFee());
        venue.setIsUniversityVenue(venueDto.getIsUniversityVenue());
        venue.setEquipmentInfo(venueDto.getEquipmentInfo());
        venue.setAccessibilityInfo(venueDto.getAccessibilityInfo());
        venue.setImageUrl(venueDto.getImageUrl());
        venue.setAvailableTimes(venueDto.getAvailableTimes());
        
        // Güncellenen mekanı kaydet
        Venue updatedVenue = venueRepository.save(venue);
        
        return mapToVenueDto(updatedVenue);
    }
    
    @Override
    @Transactional
    public void deleteVenue(Long id) {
        Venue venue = venueRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Venue", "id", id));
        
        // Aktif rezervasyonlar var mı kontrol et
        List<VenueReservation> activeReservations = reservationRepository.findByVenueId(id)
                .stream()
                .filter(r -> r.getStatus() == VenueReservation.ReservationStatus.APPROVED || 
                             r.getStatus() == VenueReservation.ReservationStatus.PENDING)
                .filter(r -> r.getEndTime().isAfter(LocalDateTime.now()))
                .collect(Collectors.toList());
        
        if (!activeReservations.isEmpty()) {
            throw new IllegalStateException("Bu mekan şu anda aktif rezervasyonlara sahip. Önce rezervasyonları iptal edin.");
        }
        
        venueRepository.delete(venue);
    }
    
    @Override
    public Map<String, Boolean> checkAvailability(Long venueId, LocalDateTime startDate, LocalDateTime endDate) {
        // Mekanı bul
        venueRepository.findById(venueId)
                .orElseThrow(() -> new ResourceNotFoundException("Venue", "id", venueId));
        
        // Çakışan rezervasyonları ara
        List<VenueReservation> overlappingReservations = 
                reservationRepository.findOverlappingReservations(venueId, startDate, endDate);
        
        Map<String, Boolean> result = new HashMap<>();
        result.put("available", overlappingReservations.isEmpty());
        result.put("hasConflicts", !overlappingReservations.isEmpty());
        result.put("conflictCount", !overlappingReservations.isEmpty() ? 
                Boolean.valueOf(overlappingReservations.size() > 0) : Boolean.FALSE);
        
        return result;
    }
    
    @Override
    public List<VenueReservationDto> getReservations(Long venueId) {
        // Mekanı bul
        venueRepository.findById(venueId)
                .orElseThrow(() -> new ResourceNotFoundException("Venue", "id", venueId));
        
        // Mekanın rezervasyonlarını getir
        List<VenueReservation> reservations = reservationRepository.findByVenueId(venueId);
        
        return reservations.stream()
                .map(this::mapToReservationDto)
                .collect(Collectors.toList());
    }
    
    @Override
    @Transactional
    public VenueReservationDto createReservation(Long venueId, VenueReservationDto reservationDto) {
        // Mekanı bul
        Venue venue = venueRepository.findById(venueId)
                .orElseThrow(() -> new ResourceNotFoundException("Venue", "id", venueId));
        
        // Çakışan rezervasyonları kontrol et
        List<VenueReservation> overlappingReservations = 
                reservationRepository.findOverlappingReservations(venueId, 
                                                                 reservationDto.getStartTime(), 
                                                                 reservationDto.getEndTime());
        
        if (!overlappingReservations.isEmpty()) {
            throw new IllegalStateException("Seçilen zaman aralığı için mekan müsait değil, çakışan rezervasyonlar var.");
        }
        
        // Yeni rezervasyon oluştur
        VenueReservation reservation = new VenueReservation();
        reservation.setVenue(venue);
        reservation.setStartTime(reservationDto.getStartTime());
        reservation.setEndTime(reservationDto.getEndTime());
        reservation.setReservationDate(LocalDateTime.now());
        reservation.setReservationCode(generateReservationCode());
        reservation.setCost(reservationDto.getCost());
        reservation.setAttendeeCount(reservationDto.getAttendeeCount());
        reservation.setSpecialRequirements(reservationDto.getSpecialRequirements());
        reservation.setStatus(VenueReservation.ReservationStatus.PENDING);
        
        // Etkinlik ilişkilendirmesi (varsa)
        if (reservationDto.getEventId() != null) {
            Event event = eventRepository.findById(reservationDto.getEventId())
                    .orElseThrow(() -> new ResourceNotFoundException("Event", "id", reservationDto.getEventId()));
            reservation.setEvent(event);
        }
        
        // Kulüp ilişkilendirmesi (varsa)
        if (reservationDto.getClubId() != null) {
            Club club = clubRepository.findById(reservationDto.getClubId())
                    .orElseThrow(() -> new ResourceNotFoundException("Club", "id", reservationDto.getClubId()));
            reservation.setClub(club);
        }
        
        // Oluşturan kullanıcı
        if (reservationDto.getCreatedById() != null) {
            User createdBy = userRepository.findById(reservationDto.getCreatedById())
                    .orElseThrow(() -> new ResourceNotFoundException("User", "id", reservationDto.getCreatedById()));
            reservation.setCreatedBy(createdBy);
        }
        
        // Rezervasyonu kaydet
        VenueReservation savedReservation = reservationRepository.save(reservation);
        
        return mapToReservationDto(savedReservation);
    }
    
    @Override
    @Transactional
    public VenueReservationDto updateReservation(Long reservationId, VenueReservationDto reservationDto) {
        // Rezervasyonu bul
        VenueReservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new ResourceNotFoundException("VenueReservation", "id", reservationId));
        
        // Ödeme veya onay durumu gibi kritik durumları kontrol et
        if (reservation.getStatus() == VenueReservation.ReservationStatus.CANCELLED || 
            reservation.getStatus() == VenueReservation.ReservationStatus.COMPLETED) {
            throw new IllegalStateException("İptal edilmiş veya tamamlanmış rezervasyonlar güncellenemez.");
        }
        
        // Tarih değişikliği varsa çakışma kontrolü yap
        if (!reservation.getStartTime().isEqual(reservationDto.getStartTime()) || 
            !reservation.getEndTime().isEqual(reservationDto.getEndTime())) {
            
            List<VenueReservation> overlappingReservations = 
                    reservationRepository.findOverlappingReservations(reservation.getVenue().getId(), 
                                                                     reservationDto.getStartTime(), 
                                                                     reservationDto.getEndTime());
            
            // Kendi rezervasyonumuzu hariç tut
            overlappingReservations = overlappingReservations.stream()
                    .filter(r -> !r.getId().equals(reservationId))
                    .collect(Collectors.toList());
            
            if (!overlappingReservations.isEmpty()) {
                throw new IllegalStateException("Seçilen zaman aralığı için mekan müsait değil, çakışan rezervasyonlar var.");
            }
        }
        
        // Rezervasyonu güncelle
        reservation.setStartTime(reservationDto.getStartTime());
        reservation.setEndTime(reservationDto.getEndTime());
        reservation.setCost(reservationDto.getCost());
        reservation.setAttendeeCount(reservationDto.getAttendeeCount());
        reservation.setSpecialRequirements(reservationDto.getSpecialRequirements());
        
        // Etkinlik ilişkilendirmesi (varsa)
        if (reservationDto.getEventId() != null) {
            Event event = eventRepository.findById(reservationDto.getEventId())
                    .orElseThrow(() -> new ResourceNotFoundException("Event", "id", reservationDto.getEventId()));
            reservation.setEvent(event);
        } else {
            reservation.setEvent(null);
        }
        
        // Kulüp ilişkilendirmesi (varsa)
        if (reservationDto.getClubId() != null) {
            Club club = clubRepository.findById(reservationDto.getClubId())
                    .orElseThrow(() -> new ResourceNotFoundException("Club", "id", reservationDto.getClubId()));
            reservation.setClub(club);
        } else {
            reservation.setClub(null);
        }
        
        // Güncellenen rezervasyonu kaydet
        VenueReservation updatedReservation = reservationRepository.save(reservation);
        
        return mapToReservationDto(updatedReservation);
    }
    
    @Override
    @Transactional
    public void cancelReservation(Long reservationId) {
        // Rezervasyonu bul
        VenueReservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new ResourceNotFoundException("VenueReservation", "id", reservationId));
        
        // Tamamlanmış rezervasyonlar iptal edilemez
        if (reservation.getStatus() == VenueReservation.ReservationStatus.COMPLETED) {
            throw new IllegalStateException("Tamamlanmış rezervasyonlar iptal edilemez.");
        }
        
        // Rezervasyonu iptal et
        reservation.setStatus(VenueReservation.ReservationStatus.CANCELLED);
        reservationRepository.save(reservation);
    }
    
    @Override
    @Transactional
    public VenueReservationDto updateReservationStatus(Long reservationId, String status) {
        // Rezervasyonu bul
        VenueReservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new ResourceNotFoundException("VenueReservation", "id", reservationId));
        
        try {
            VenueReservation.ReservationStatus newStatus = VenueReservation.ReservationStatus.valueOf(status.toUpperCase());
            
            // İptal edilmiş rezervasyonların durumu değiştirilemez
            if (reservation.getStatus() == VenueReservation.ReservationStatus.CANCELLED && 
                newStatus != VenueReservation.ReservationStatus.CANCELLED) {
                throw new IllegalStateException("İptal edilmiş rezervasyonların durumu değiştirilemez.");
            }
            
            // Rezervasyon durumunu güncelle
            reservation.setStatus(newStatus);
            
            // Onay varsa, onay bilgilerini güncelle
            if (newStatus == VenueReservation.ReservationStatus.APPROVED) {
                reservation.setApprovalDate(LocalDateTime.now());
            }
            
            VenueReservation updatedReservation = reservationRepository.save(reservation);
            
            return mapToReservationDto(updatedReservation);
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Geçersiz rezervasyon durumu: " + status);
        }
    }
    
    @Override
    public boolean isReservationMadeByClub(Long userId, Long reservationId) {
        // Rezervasyonu bul
        VenueReservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new ResourceNotFoundException("VenueReservation", "id", reservationId));
        
        // Rezervasyon bir kulübe ait değilse, yetki yok
        if (reservation.getClub() == null) {
            return false;
        }
        
        // Kullanıcının kulüpte başkan olup olmadığını kontrol et
        List<ClubMembership> memberships = clubMembershipRepository.findByUserIdAndClubId(userId, reservation.getClub().getId())
                .stream()
                .filter(m -> m.getRole() == ClubMembership.Role.PRESIDENT && m.getIsActive())
                .collect(Collectors.toList());
        
        return !memberships.isEmpty();
    }
    
    // Yardımcı metodlar
    private VenueDto mapToVenueDto(Venue venue) {
        VenueDto dto = modelMapper.map(venue, VenueDto.class);
        
        // Oluşturan kullanıcı bilgilerini ayarla
        if (venue.getCreatedBy() != null) {
            dto.setCreatedById(venue.getCreatedBy().getId());
            dto.setCreatedByName(venue.getCreatedBy().getFullName());
        }
        
        // Gelecek rezervasyonları sayısını ayarla
        long upcomingReservations = venue.getReservations().stream()
                .filter(r -> r.getStatus() == VenueReservation.ReservationStatus.APPROVED || 
                            r.getStatus() == VenueReservation.ReservationStatus.PENDING)
                .filter(r -> r.getEndTime().isAfter(LocalDateTime.now()))
                .count();
        
        dto.setUpcomingReservationsCount((int) upcomingReservations);
        
        // Şu anda müsait olma durumunu ayarla
        boolean isAvailable = venue.getReservations().stream()
                .filter(r -> r.getStatus() == VenueReservation.ReservationStatus.APPROVED)
                .noneMatch(r -> r.getStartTime().isBefore(LocalDateTime.now()) && 
                               r.getEndTime().isAfter(LocalDateTime.now()));
        
        dto.setAvailable(isAvailable);
        
        return dto;
    }
    
    private VenueReservationDto mapToReservationDto(VenueReservation reservation) {
        VenueReservationDto dto = modelMapper.map(reservation, VenueReservationDto.class);
        
        // İlişkili entity'lerin bilgilerini ayarla
        dto.setVenueId(reservation.getVenue().getId());
        dto.setVenueName(reservation.getVenue().getName());
        
        if (reservation.getEvent() != null) {
            dto.setEventId(reservation.getEvent().getId());
            dto.setEventTitle(reservation.getEvent().getTitle());
        }
        
        if (reservation.getClub() != null) {
            dto.setClubId(reservation.getClub().getId());
            dto.setClubName(reservation.getClub().getName());
        }
        
        if (reservation.getCreatedBy() != null) {
            dto.setCreatedById(reservation.getCreatedBy().getId());
            dto.setCreatedByName(reservation.getCreatedBy().getFullName());
        }
        
        if (reservation.getApprovedBy() != null) {
            dto.setApprovedById(reservation.getApprovedBy().getId());
            dto.setApprovedByName(reservation.getApprovedBy().getFullName());
        }
        
        return dto;
    }
    
    private String generateReservationCode() {
        return "VENUE-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }
} 