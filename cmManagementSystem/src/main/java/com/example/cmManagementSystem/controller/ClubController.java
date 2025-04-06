package com.example.cmManagementSystem.controller;

import com.example.cmManagementSystem.dto.ClubDto;
import com.example.cmManagementSystem.dto.UserDto;
import com.example.cmManagementSystem.entity.User;
import com.example.cmManagementSystem.service.ClubService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping({"/api/clubs", "/clubs"})
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"}, allowCredentials = "true")
public class ClubController {

    private final ClubService clubService;

    @Autowired
    public ClubController(ClubService clubService) {
        this.clubService = clubService;
    }

    // Tüm kulüpleri getir - Tüm kullanıcılar erişebilir
    @GetMapping
    public ResponseEntity<List<ClubDto>> getAllClubs() {
        System.out.println("ClubController - Tüm kulüpler istendi. İstek başarıyla işleniyor...");
        return ResponseEntity.ok(clubService.findAll());
    }

    // ID'ye göre kulüp getir - Tüm kullanıcılar erişebilir
    @GetMapping("/{id}")
    public ResponseEntity<ClubDto> getClubById(@PathVariable Long id) {
        System.out.println("ClubController - ID'ye göre kulüp istendi: " + id);
        return ResponseEntity.ok(clubService.findById(id));
    }

    // Kulüp adına göre kulüp getir - Tüm kullanıcılar erişebilir
    @GetMapping("/name/{name}")
    public ResponseEntity<ClubDto> getClubByName(@PathVariable String name) {
        System.out.println("ClubController - Ada göre kulüp istendi: " + name);
        return ResponseEntity.ok(clubService.findByName(name));
    }
    
    // Kulüp kategorilerini getir - Frontend için gerekli
    @GetMapping("/categories")
    public ResponseEntity<List<String>> getCategories() {
        System.out.println("ClubController - Kategoriler istendi");
        // Varsayılan kategoriler
        List<String> categories = List.of("Spor", "Kültür", "Sanat", "Bilim", "Teknoloji", "Diğer");
        return ResponseEntity.ok(categories);
    }

    // Yeni kulüp oluştur (sadece ADMIN)
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ClubDto> createClub(
            @RequestParam(required = true) String name,
            @RequestParam(required = true) String description,
            @RequestParam(required = false) Integer maxMembers,
            @RequestParam(required = true) Long presidentId,
            @RequestParam(required = false) String foundationDate,
            @RequestPart(value = "logo", required = false) MultipartFile logo) {
        
        System.out.println("=================================================================");
        System.out.println("ClubController - Kulüp oluşturma isteği alındı: " + name);
        
        // Kullanıcı rolünü kontrol et
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        System.out.println("ClubController - İstek yapan kullanıcı: " + authentication.getName());
        System.out.println("ClubController - Kullanıcı kimliği: " + authentication.isAuthenticated());
        System.out.println("ClubController - Kullanıcı rolleri: " + authentication.getAuthorities());
        System.out.println("ClubController - Principal: " + authentication.getPrincipal());
        
        // Daha detaylı parametre bilgisi yazdır
        System.out.println("ClubController - Form parametreleri: " +
                "\nName: " + name +
                "\nDescription: " + description +
                "\nMaxMembers: " + (maxMembers != null ? maxMembers : "null") +
                "\nPresidentId: " + presidentId +
                "\nFoundationDate: " + (foundationDate != null ? foundationDate : "null"));
        
        // Logo işleme
        String logoUrl = null;
        if (logo != null && !logo.isEmpty()) {
            System.out.println("ClubController - Logo alındı: " + logo.getOriginalFilename() + ", " + logo.getSize() + " bytes");
            
            try {
                // Logo dosyasını kaydet ve URL'ini al
                String fileName = UUID.randomUUID().toString() + "_" + logo.getOriginalFilename();
                Path uploadDir = Paths.get("uploads/club-logos");
                
                // Dizini oluştur (eğer yoksa)
                if (!Files.exists(uploadDir)) {
                    Files.createDirectories(uploadDir);
                }
                
                // Dosyayı kaydet
                Path targetLocation = uploadDir.resolve(fileName);
                Files.copy(logo.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);
                
                // Logo URL'ini oluştur
                logoUrl = "http://localhost:8080/uploads/club-logos/" + fileName;
                System.out.println("ClubController - Logo URL'i oluşturuldu: " + logoUrl);
            } catch (IOException e) {
                System.err.println("ClubController - Logo kaydedilemedi: " + e.getMessage());
                e.printStackTrace();
            }
        } else {
            System.out.println("ClubController - Logo alınmadı veya boş");
        }
        
        // ClubDto oluştur
        ClubDto clubDto = new ClubDto();
        clubDto.setName(name);
        clubDto.setDescription(description);
        clubDto.setMaxMembers(maxMembers);
        clubDto.setPresidentId(presidentId);
        clubDto.setLogo(logoUrl); // Logo URL'ini ayarla
        
        if (foundationDate != null && !foundationDate.isEmpty()) {
            try {
                clubDto.setFoundationDate(LocalDateTime.parse(foundationDate));
            } catch (Exception e) {
                System.err.println("ClubController - FoundationDate dönüştürme hatası: " + e.getMessage());
            }
        }
        
        try {
            System.out.println("ClubController - ClubService.createClub çağrılıyor...");
            ClubDto createdClub = clubService.createClub(clubDto);
            System.out.println("ClubController - Kulüp başarıyla oluşturuldu: " + createdClub.getId() + " - " + createdClub.getName());
            System.out.println("ClubController - Oluşturulan logo URL: " + createdClub.getLogo());
            System.out.println("=================================================================");
            return new ResponseEntity<>(createdClub, HttpStatus.CREATED);
        } catch (Exception e) {
            System.err.println("ClubController - Kulüp oluşturma hatası: " + e.getMessage());
            e.printStackTrace();
            System.out.println("=================================================================");
            throw e;
        }
    }

    // Kulüp güncelle (ADMIN veya CLUB_PRESIDENT)
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or (hasRole('CLUB_PRESIDENT') and @clubAuthService.isPresidentOfClub(authentication.principal, #id))")
    public ResponseEntity<ClubDto> updateClub(@PathVariable Long id, @Valid @RequestBody ClubDto clubDto) {
        return ResponseEntity.ok(clubService.updateClub(id, clubDto));
    }

    // Kulübü sil (sadece ADMIN)
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteClub(@PathVariable Long id) {
        clubService.deleteClub(id);
        return ResponseEntity.noContent().build();
    }

    // Kulüp başkanını değiştir (sadece ADMIN)
    @PutMapping("/{clubId}/president/{userId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ClubDto> changeClubPresident(
            @PathVariable Long clubId,
            @PathVariable Long userId) {
        return ResponseEntity.ok(clubService.changeClubPresident(clubId, userId));
    }

    // Kulüp üyelerini getir
    @GetMapping("/{clubId}/members")
    public ResponseEntity<List<UserDto>> getClubMembers(@PathVariable Long clubId) {
        return ResponseEntity.ok(clubService.getClubMembers(clubId));
    }

    // Kulübe üye ekle (ADMIN veya CLUB_PRESIDENT)
    @PostMapping("/{clubId}/members/{userId}")
    @PreAuthorize("hasRole('ADMIN') or (hasRole('CLUB_PRESIDENT') and @clubAuthService.isPresidentOfClub(authentication.principal, #clubId))")
    public ResponseEntity<UserDto> addClubMember(
            @PathVariable Long clubId,
            @PathVariable Long userId,
            @RequestParam User.Role role) {
        return ResponseEntity.ok(clubService.addClubMember(clubId, userId, role));
    }

    // Kulüp üyesi rolünü değiştir (ADMIN veya CLUB_PRESIDENT)
    @PutMapping("/{clubId}/members/{userId}/role")
    @PreAuthorize("hasRole('ADMIN') or (hasRole('CLUB_PRESIDENT') and @clubAuthService.isPresidentOfClub(authentication.principal, #clubId))")
    public ResponseEntity<UserDto> changeClubMemberRole(
            @PathVariable Long clubId,
            @PathVariable Long userId,
            @RequestParam User.Role newRole) {
        return ResponseEntity.ok(clubService.changeClubMemberRole(clubId, userId, newRole));
    }

    // Kulüpten üye çıkar (ADMIN veya CLUB_PRESIDENT)
    @DeleteMapping("/{clubId}/members/{userId}")
    @PreAuthorize("hasRole('ADMIN') or (hasRole('CLUB_PRESIDENT') and @clubAuthService.isPresidentOfClub(authentication.principal, #clubId))")
    public ResponseEntity<Void> removeClubMember(
            @PathVariable Long clubId,
            @PathVariable Long userId) {
        clubService.removeClubMember(clubId, userId);
        return ResponseEntity.noContent().build();
    }

    // Kulüp durumunu değiştir (sadece ADMIN)
    @PutMapping("/{clubId}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ClubDto> setClubStatus(
            @PathVariable Long clubId,
            @RequestParam boolean active) {
        return ResponseEntity.ok(clubService.setClubStatus(clubId, active));
    }
}