package com.example.cmManagementSystem.controller;

import com.example.cmManagementSystem.dto.SponsorDto;
import com.example.cmManagementSystem.service.SponsorService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/sponsors")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class SponsorController {
    
    private final SponsorService sponsorService;
    
    @Autowired
    public SponsorController(SponsorService sponsorService) {
        this.sponsorService = sponsorService;
    }
    
    // Tüm sponsorları getir
    @GetMapping
    public ResponseEntity<List<SponsorDto>> getAllSponsors() {
        return ResponseEntity.ok(sponsorService.findAll());
    }
    
    // ID'ye göre sponsor getir
    @GetMapping("/{id}")
    public ResponseEntity<SponsorDto> getSponsorById(@PathVariable Long id) {
        return ResponseEntity.ok(sponsorService.findById(id));
    }
    
    // Kulübe ait sponsorları getir
    @GetMapping("/club/{clubId}")
    public ResponseEntity<List<SponsorDto>> getSponsorsByClub(@PathVariable Long clubId) {
        return ResponseEntity.ok(sponsorService.findByClub(clubId));
    }
    
    // Yeni sponsor oluştur (ADMIN veya CLUB_PRESIDENT)
    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('CLUB_PRESIDENT')")
    public ResponseEntity<SponsorDto> createSponsor(@Valid @RequestBody SponsorDto sponsorDto) {
        return new ResponseEntity<>(sponsorService.createSponsor(sponsorDto), HttpStatus.CREATED);
    }
    
    // Kulübe sponsor ekle (ADMIN veya CLUB_PRESIDENT)
    @PostMapping("/club/{clubId}")
    @PreAuthorize("hasRole('ADMIN') or (hasRole('CLUB_PRESIDENT') and @clubAuthService.isPresidentOfClub(authentication.principal, #clubId))")
    public ResponseEntity<SponsorDto> addSponsorToClub(
            @PathVariable Long clubId,
            @Valid @RequestBody SponsorDto sponsorDto) {
        return new ResponseEntity<>(sponsorService.addSponsorToClub(clubId, sponsorDto), HttpStatus.CREATED);
    }
    
    // Sponsor güncelle (ADMIN veya CLUB_PRESIDENT)
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or (hasRole('CLUB_PRESIDENT') and @sponsorService.isSponsorOfClub(authentication.principal, #id))")
    public ResponseEntity<SponsorDto> updateSponsor(@PathVariable Long id, @Valid @RequestBody SponsorDto sponsorDto) {
        return ResponseEntity.ok(sponsorService.updateSponsor(id, sponsorDto));
    }
    
    // Sponsor sil (ADMIN veya CLUB_PRESIDENT)
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or (hasRole('CLUB_PRESIDENT') and @sponsorService.isSponsorOfClub(authentication.principal, #id))")
    public ResponseEntity<Void> deleteSponsor(@PathVariable Long id) {
        sponsorService.deleteSponsor(id);
        return ResponseEntity.noContent().build();
    }
    
    // Kulüpten sponsor kaldır (ADMIN veya CLUB_PRESIDENT)
    @DeleteMapping("/club/{clubId}/sponsor/{sponsorId}")
    @PreAuthorize("hasRole('ADMIN') or (hasRole('CLUB_PRESIDENT') and @clubAuthService.isPresidentOfClub(authentication.principal, #clubId))")
    public ResponseEntity<Void> removeSponsorFromClub(
            @PathVariable Long clubId,
            @PathVariable Long sponsorId) {
        sponsorService.removeSponsorFromClub(clubId, sponsorId);
        return ResponseEntity.noContent().build();
    }
} 