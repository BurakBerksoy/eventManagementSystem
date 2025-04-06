package com.example.cmManagementSystem.service;

import com.example.cmManagementSystem.dto.VenueDto;
import com.example.cmManagementSystem.dto.VenueReservationDto;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/**
 * Mekân işlemlerini yöneten servis
 */
public interface VenueService {
    
    /**
     * Tüm mekânları getirir
     */
    List<VenueDto> findAll();
    
    /**
     * ID'ye göre mekân getirir
     */
    VenueDto findById(Long id);
    
    /**
     * Yeni mekân oluşturur
     */
    VenueDto createVenue(VenueDto venueDto);
    
    /**
     * Mekânı günceller
     */
    VenueDto updateVenue(Long id, VenueDto venueDto);
    
    /**
     * Mekânı siler
     */
    void deleteVenue(Long id);
    
    /**
     * Mekânın belirli tarih aralığında müsaitlik durumunu kontrol eder
     */
    Map<String, Boolean> checkAvailability(Long venueId, LocalDateTime startDate, LocalDateTime endDate);
    
    /**
     * Mekâna ait rezervasyonları getirir
     */
    List<VenueReservationDto> getReservations(Long venueId);
    
    /**
     * Mekân için yeni rezervasyon oluşturur
     */
    VenueReservationDto createReservation(Long venueId, VenueReservationDto reservationDto);
    
    /**
     * Rezervasyonu günceller
     */
    VenueReservationDto updateReservation(Long reservationId, VenueReservationDto reservationDto);
    
    /**
     * Rezervasyonu iptal eder
     */
    void cancelReservation(Long reservationId);
    
    /**
     * Rezervasyon durumunu günceller
     */
    VenueReservationDto updateReservationStatus(Long reservationId, String status);
    
    /**
     * Belirtilen kullanıcının kulübünün rezervasyonu olup olmadığını kontrol eder
     */
    boolean isReservationMadeByClub(Long userId, Long reservationId);
} 