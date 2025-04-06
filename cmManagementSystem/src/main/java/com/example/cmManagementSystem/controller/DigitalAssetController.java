package com.example.cmManagementSystem.controller;

import com.example.cmManagementSystem.dto.DigitalAssetDto;
import com.example.cmManagementSystem.service.DigitalAssetService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/digital-assets")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class DigitalAssetController {
    
    private final DigitalAssetService digitalAssetService;
    
    @Autowired
    public DigitalAssetController(DigitalAssetService digitalAssetService) {
        this.digitalAssetService = digitalAssetService;
    }
    
    // Tüm dijital varlıkları getir
    @GetMapping
    public ResponseEntity<List<DigitalAssetDto>> getAllAssets() {
        return ResponseEntity.ok(digitalAssetService.findAll());
    }
    
    // ID'ye göre dijital varlık getir
    @GetMapping("/{id}")
    public ResponseEntity<DigitalAssetDto> getAssetById(@PathVariable Long id) {
        return ResponseEntity.ok(digitalAssetService.findById(id));
    }
    
    // Kulübe ait dijital varlıkları getir
    @GetMapping("/club/{clubId}")
    public ResponseEntity<List<DigitalAssetDto>> getAssetsByClub(@PathVariable Long clubId) {
        return ResponseEntity.ok(digitalAssetService.findByClub(clubId));
    }
    
    // Etkinliğe ait dijital varlıkları getir
    @GetMapping("/event/{eventId}")
    public ResponseEntity<List<DigitalAssetDto>> getAssetsByEvent(@PathVariable Long eventId) {
        return ResponseEntity.ok(digitalAssetService.findByEvent(eventId));
    }
    
    // Tür/kategoriye göre dijital varlıkları getir
    @GetMapping("/type/{type}")
    public ResponseEntity<List<DigitalAssetDto>> getAssetsByType(@PathVariable String type) {
        return ResponseEntity.ok(digitalAssetService.findByType(type));
    }
    
    // Dosya yükle (Multipart dosya ve Metadata)
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('ADMIN') or hasRole('CLUB_PRESIDENT')")
    public ResponseEntity<DigitalAssetDto> uploadAsset(
            @RequestPart("file") MultipartFile file,
            @RequestPart("metadata") @Valid DigitalAssetDto assetDto) {
        return new ResponseEntity<>(digitalAssetService.uploadAsset(file, assetDto), HttpStatus.CREATED);
    }
    
    // Etkinliğe dijital varlık ekle
    @PostMapping(value = "/event/{eventId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('ADMIN') or (hasRole('CLUB_PRESIDENT') and @eventAuthService.isEventCreatedByUser(authentication.principal, #eventId))")
    public ResponseEntity<DigitalAssetDto> uploadEventAsset(
            @PathVariable Long eventId,
            @RequestPart("file") MultipartFile file,
            @RequestPart("metadata") @Valid DigitalAssetDto assetDto) {
        return new ResponseEntity<>(digitalAssetService.uploadEventAsset(eventId, file, assetDto), HttpStatus.CREATED);
    }
    
    // Kulübe dijital varlık ekle
    @PostMapping(value = "/club/{clubId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('ADMIN') or (hasRole('CLUB_PRESIDENT') and @clubAuthService.isPresidentOfClub(authentication.principal, #clubId))")
    public ResponseEntity<DigitalAssetDto> uploadClubAsset(
            @PathVariable Long clubId,
            @RequestPart("file") MultipartFile file,
            @RequestPart("metadata") @Valid DigitalAssetDto assetDto) {
        return new ResponseEntity<>(digitalAssetService.uploadClubAsset(clubId, file, assetDto), HttpStatus.CREATED);
    }
    
    // Dijital varlık bilgilerini güncelle (sadece metadata, dosya değil)
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or (hasRole('CLUB_PRESIDENT') and @digitalAssetService.isAssetOwnedByUser(authentication.principal, #id))")
    public ResponseEntity<DigitalAssetDto> updateAsset(
            @PathVariable Long id,
            @Valid @RequestBody DigitalAssetDto assetDto) {
        return ResponseEntity.ok(digitalAssetService.updateAsset(id, assetDto));
    }
    
    // Dijital varlığı sil
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or (hasRole('CLUB_PRESIDENT') and @digitalAssetService.isAssetOwnedByUser(authentication.principal, #id))")
    public ResponseEntity<Void> deleteAsset(@PathVariable Long id) {
        digitalAssetService.deleteAsset(id);
        return ResponseEntity.noContent().build();
    }
    
    // Dosya içeriğini raw olarak getir
    @GetMapping("/{id}/download")
    public ResponseEntity<byte[]> downloadAsset(@PathVariable Long id) {
        return digitalAssetService.downloadAsset(id);
    }
} 