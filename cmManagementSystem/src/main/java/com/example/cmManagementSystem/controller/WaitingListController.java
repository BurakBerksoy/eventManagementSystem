package com.example.cmManagementSystem.controller;

import com.example.cmManagementSystem.dto.WaitingListDto;
import com.example.cmManagementSystem.dto.UserDto;
import com.example.cmManagementSystem.service.WaitingListService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/waiting-lists")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class WaitingListController {
    
    private final WaitingListService waitingListService;
    
    @Autowired
    public WaitingListController(WaitingListService waitingListService) {
        this.waitingListService = waitingListService;
    }
    
    // Etkinliğe ait bekleme listesini getir
    @GetMapping("/event/{eventId}")
    public ResponseEntity<List<WaitingListDto>> getWaitingListByEvent(@PathVariable Long eventId) {
        return ResponseEntity.ok(waitingListService.findByEvent(eventId));
    }
    
    // Bekleme listesindeki kullanıcıları getir
    @GetMapping("/event/{eventId}/users")
    @PreAuthorize("hasRole('ADMIN') or (hasRole('CLUB_PRESIDENT') and @eventAuthService.isEventCreatedByUser(authentication.principal, #eventId))")
    public ResponseEntity<List<UserDto>> getUsersInWaitingList(@PathVariable Long eventId) {
        return ResponseEntity.ok(waitingListService.findUsersByEvent(eventId));
    }
    
    // Kullanıcı bekleme listesine ekle
    @PostMapping("/event/{eventId}/user/{userId}")
    @PreAuthorize("hasRole('ADMIN') or (hasRole('CLUB_PRESIDENT') and @eventAuthService.isEventCreatedByUser(authentication.principal, #eventId)) or #userId == authentication.principal.id")
    public ResponseEntity<WaitingListDto> addUserToWaitingList(
            @PathVariable Long eventId,
            @PathVariable Long userId,
            @RequestBody(required = false) String note) {
        return new ResponseEntity<>(waitingListService.addToWaitingList(eventId, userId, note), HttpStatus.CREATED);
    }
    
    // Kullanıcı bekleme listesinden çıkar
    @DeleteMapping("/event/{eventId}/user/{userId}")
    @PreAuthorize("hasRole('ADMIN') or (hasRole('CLUB_PRESIDENT') and @eventAuthService.isEventCreatedByUser(authentication.principal, #eventId)) or #userId == authentication.principal.id")
    public ResponseEntity<Void> removeUserFromWaitingList(
            @PathVariable Long eventId,
            @PathVariable Long userId) {
        waitingListService.removeFromWaitingList(eventId, userId);
        return ResponseEntity.noContent().build();
    }
    
    // Bekleme listesinde sıra değiştir (öncelik değiştir)
    @PutMapping("/event/{eventId}/reorder")
    @PreAuthorize("hasRole('ADMIN') or (hasRole('CLUB_PRESIDENT') and @eventAuthService.isEventCreatedByUser(authentication.principal, #eventId))")
    public ResponseEntity<List<WaitingListDto>> reorderWaitingList(
            @PathVariable Long eventId,
            @Valid @RequestBody List<WaitingListDto> waitingList) {
        return ResponseEntity.ok(waitingListService.reorderWaitingList(eventId, waitingList));
    }
    
    // Kullanıcının bekleme listesi durumunu kontrol et
    @GetMapping("/event/{eventId}/user/{userId}/status")
    public ResponseEntity<WaitingListDto> checkUserWaitingStatus(
            @PathVariable Long eventId,
            @PathVariable Long userId) {
        return ResponseEntity.ok(waitingListService.findByEventAndUser(eventId, userId));
    }
    
    // Bekleme listesinden katılımcılar listesine taşı
    @PostMapping("/event/{eventId}/promote/{userId}")
    @PreAuthorize("hasRole('ADMIN') or (hasRole('CLUB_PRESIDENT') and @eventAuthService.isEventCreatedByUser(authentication.principal, #eventId))")
    public ResponseEntity<Void> promoteToParticipant(
            @PathVariable Long eventId,
            @PathVariable Long userId) {
        waitingListService.promoteToParticipant(eventId, userId);
        return ResponseEntity.ok().build();
    }
    
    // Otomatik olarak boş kontenjan varsa bekleme listesindeki kişileri katılımcı olarak ekle
    @PostMapping("/event/{eventId}/auto-promote")
    @PreAuthorize("hasRole('ADMIN') or (hasRole('CLUB_PRESIDENT') and @eventAuthService.isEventCreatedByUser(authentication.principal, #eventId))")
    public ResponseEntity<Integer> autoPromoteFromWaitingList(
            @PathVariable Long eventId,
            @RequestParam(defaultValue = "0") int limit) {
        int promoted = waitingListService.autoPromoteFromWaitingList(eventId, limit);
        return ResponseEntity.ok(promoted);
    }
} 