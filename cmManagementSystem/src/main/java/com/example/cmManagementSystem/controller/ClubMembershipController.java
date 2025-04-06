package com.example.cmManagementSystem.controller;

import com.example.cmManagementSystem.dto.ApiResponse;
import com.example.cmManagementSystem.dto.ClubMembershipDto;
import com.example.cmManagementSystem.dto.ClubMembershipRequestDto;
import com.example.cmManagementSystem.entity.User;
import com.example.cmManagementSystem.service.ClubMembershipService;
import com.example.cmManagementSystem.service.NotificationService;
import com.example.cmManagementSystem.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/clubs")
@RequiredArgsConstructor
public class ClubMembershipController {
    
    private final ClubMembershipService membershipService;
    private final UserService userService;
    private final NotificationService notificationService;

    /**
     * Kulübe katılma isteği gönderir
     * 
     * @param clubId Kulüp ID
     * @param auth Kimlik doğrulama
     * @return API yanıtı
     */
    @PostMapping("/{clubId}/request-membership")
    public ResponseEntity<ApiResponse<ClubMembershipDto>> requestMembership(
            @PathVariable Long clubId,
            @RequestBody(required = false) ClubMembershipRequestDto requestDto,
            Authentication auth) {
        
        // Kullanıcı bilgisini al
        User user = (User) auth.getPrincipal();
        
        // İstek açıklaması
        String message = (requestDto != null && requestDto.getMessage() != null) 
                ? requestDto.getMessage() : "";
        
        // Üyelik isteği oluştur
        ClubMembershipDto request = membershipService.createMembershipRequest(clubId, user.getId(), message);
        
        // Başarılı yanıt
        return ResponseEntity.ok(ApiResponse.success("Kulüp üyelik isteği başarıyla gönderildi", request));
    }
    
    /**
     * Kulüp üyelik isteğini onaylar
     * 
     * @param requestId İstek ID
     * @param auth Kimlik doğrulama
     * @return API yanıtı
     */
    @PostMapping("/membership-requests/{requestId}/approve")
    public ResponseEntity<ApiResponse<ClubMembershipDto>> approveMembershipRequest(
            @PathVariable Long requestId,
            Authentication auth) {
        
        // Kullanıcı bilgisini al
        User user = (User) auth.getPrincipal();
        
        // İsteği onayla
        ClubMembershipDto membership = membershipService.approveMembershipRequest(requestId, user.getId());
        
        // Başarılı yanıt
        return ResponseEntity.ok(ApiResponse.success("Kulüp üyelik isteği onaylandı", membership));
    }
    
    /**
     * Kulüp üyelik isteğini reddeder
     * 
     * @param requestId İstek ID
     * @param auth Kimlik doğrulama
     * @return API yanıtı
     */
    @PostMapping("/membership-requests/{requestId}/reject")
    public ResponseEntity<ApiResponse<Void>> rejectMembershipRequest(
            @PathVariable Long requestId,
            Authentication auth) {
        
        // Kullanıcı bilgisini al
        User user = (User) auth.getPrincipal();
        
        // İsteği reddet
        membershipService.rejectMembershipRequest(requestId, user.getId());
        
        // Başarılı yanıt
        return ResponseEntity.ok(ApiResponse.success("Kulüp üyelik isteği reddedildi", null));
    }
    
    /**
     * Kulüp için bekleyen üyelik isteklerini getirir
     * 
     * @param clubId Kulüp ID
     * @param auth Kimlik doğrulama
     * @return İstek listesi
     */
    @GetMapping("/{clubId}/membership-requests")
    public ResponseEntity<List<ClubMembershipRequestDto>> getPendingMembershipRequests(
            @PathVariable Long clubId,
            Authentication auth) {
        
        // Kullanıcı bilgisini al
        User user = (User) auth.getPrincipal();
        
        // Kulübün bekleyen isteklerini getir
        List<ClubMembershipRequestDto> requests = membershipService.getPendingMembershipRequests(clubId, user.getId());
        
        // Başarılı yanıt
        return ResponseEntity.ok(requests);
    }
    
    /**
     * Kullanıcının kulüpten ayrılmasını sağlar
     * 
     * @param clubId Kulüp ID
     * @param auth Kimlik doğrulama
     * @return API yanıtı
     */
    @PostMapping("/{clubId}/leave")
    public ResponseEntity<ApiResponse<Void>> leaveClub(
            @PathVariable Long clubId,
            Authentication auth) {
        
        // Kullanıcı bilgisini al
        User user = (User) auth.getPrincipal();
        
        // Kulüpten ayrıl
        membershipService.leaveClub(clubId, user.getId());
        
        // Başarılı yanıt
        return ResponseEntity.ok(ApiResponse.success("Kulüpten başarıyla ayrıldınız", null));
    }
} 