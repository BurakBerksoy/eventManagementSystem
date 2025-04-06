package com.example.cmManagementSystem.controller;

import com.example.cmManagementSystem.dto.VenueDto;
import com.example.cmManagementSystem.dto.VenueReservationDto;
import com.example.cmManagementSystem.service.VenueService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/venues")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class VenueController {
    
    private final VenueService venueService;
    
    @Autowired
    public VenueController(VenueService venueService) {
        this.venueService = venueService;
    }
    
    // Tüm mekanları getir
    @GetMapping
    public ResponseEntity<List<VenueDto>> getAllVenues() {
        return ResponseEntity.ok(venueService.findAll());
    }
    
    // ID'ye göre mekan getir
    @GetMapping("/{id}")
    public ResponseEntity<VenueDto> getVenueById(@PathVariable Long id) {
        return ResponseEntity.ok(venueService.findById(id));
    }
    
    // Yeni mekan oluştur (sadece ADMIN)
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<VenueDto> createVenue(@Valid @RequestBody VenueDto venueDto) {
        return new ResponseEntity<>(venueService.createVenue(venueDto), HttpStatus.CREATED);
    }
    
    // Mekanı güncelle (sadece ADMIN)
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<VenueDto> updateVenue(@PathVariable Long id, @Valid @RequestBody VenueDto venueDto) {
        return ResponseEntity.ok(venueService.updateVenue(id, venueDto));
    }
    
    // Mekanı sil (sadece ADMIN)
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteVenue(@PathVariable Long id) {
        venueService.deleteVenue(id);
        return ResponseEntity.noContent().build();
    }
    
    // Mekan müsaitlik durumunu kontrol et
    @GetMapping("/{id}/availability")
    public ResponseEntity<Map<String, Boolean>> checkVenueAvailability(
            @PathVariable Long id,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        return ResponseEntity.ok(venueService.checkAvailability(id, startDate, endDate));
    }
    
    // Mekana ait tüm rezervasyonları getir (ADMIN veya CLUB_PRESIDENT)
    @GetMapping("/{id}/reservations")
    @PreAuthorize("hasRole('ADMIN') or hasRole('CLUB_PRESIDENT')")
    public ResponseEntity<List<VenueReservationDto>> getVenueReservations(@PathVariable Long id) {
        return ResponseEntity.ok(venueService.getReservations(id));
    }
    
    // Yeni rezervasyon oluştur (ADMIN veya CLUB_PRESIDENT)
    @PostMapping("/{id}/reservations")
    @PreAuthorize("hasRole('ADMIN') or hasRole('CLUB_PRESIDENT')")
    public ResponseEntity<VenueReservationDto> createReservation(
            @PathVariable Long id,
            @Valid @RequestBody VenueReservationDto reservationDto) {
        return new ResponseEntity<>(venueService.createReservation(id, reservationDto), HttpStatus.CREATED);
    }
    
    // Rezervasyon güncelle (ADMIN veya CLUB_PRESIDENT)
    @PutMapping("/reservations/{id}")
    @PreAuthorize("hasRole('ADMIN') or (hasRole('CLUB_PRESIDENT') and @venueService.isReservationMadeByClub(authentication.principal, #id))")
    public ResponseEntity<VenueReservationDto> updateReservation(
            @PathVariable Long id,
            @Valid @RequestBody VenueReservationDto reservationDto) {
        return ResponseEntity.ok(venueService.updateReservation(id, reservationDto));
    }
    
    // Rezervasyon iptal et (ADMIN veya CLUB_PRESIDENT)
    @DeleteMapping("/reservations/{id}")
    @PreAuthorize("hasRole('ADMIN') or (hasRole('CLUB_PRESIDENT') and @venueService.isReservationMadeByClub(authentication.principal, #id))")
    public ResponseEntity<Void> cancelReservation(@PathVariable Long id) {
        venueService.cancelReservation(id);
        return ResponseEntity.noContent().build();
    }
    
    // Rezervasyon onayını güncelle (sadece ADMIN)
    @PutMapping("/reservations/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<VenueReservationDto> updateReservationStatus(
            @PathVariable Long id,
            @RequestParam String status) {
        return ResponseEntity.ok(venueService.updateReservationStatus(id, status));
    }
} 