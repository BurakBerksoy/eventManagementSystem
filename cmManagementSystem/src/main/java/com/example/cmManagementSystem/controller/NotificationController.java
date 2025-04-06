package com.example.cmManagementSystem.controller;

import com.example.cmManagementSystem.dto.ApiResponse;
import com.example.cmManagementSystem.dto.NotificationDto;
import com.example.cmManagementSystem.entity.User;
import com.example.cmManagementSystem.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {
    
    private final NotificationService notificationService;
    
    /**
     * Kullanıcının bildirimlerini getirir
     * 
     * @param auth Kullanıcı kimlik doğrulaması
     * @return Bildirim listesi
     */
    @GetMapping
    public ResponseEntity<List<NotificationDto>> getUserNotifications(Authentication auth) {
        User user = (User) auth.getPrincipal();
        List<NotificationDto> notifications = notificationService.getUserNotifications(user.getId());
        return ResponseEntity.ok(notifications);
    }
    
    /**
     * Kullanıcının okunmamış bildirim sayısını getirir
     * 
     * @param auth Kullanıcı kimlik doğrulaması
     * @return Okunmamış bildirim sayısı
     */
    @GetMapping("/unread-count")
    public ResponseEntity<ApiResponse<Integer>> getUnreadNotificationCount(Authentication auth) {
        User user = (User) auth.getPrincipal();
        int count = notificationService.getUnreadNotificationCount(user.getId());
        return ResponseEntity.ok(ApiResponse.success("Okunmamış bildirim sayısı", count));
    }
    
    /**
     * Bir bildirimi okundu olarak işaretler
     * 
     * @param notificationId Bildirim ID
     * @param auth Kullanıcı kimlik doğrulaması
     * @return Güncellenen bildirim
     */
    @PostMapping("/{notificationId}/mark-as-read")
    public ResponseEntity<ApiResponse<NotificationDto>> markAsRead(
            @PathVariable Long notificationId, Authentication auth) {
        User user = (User) auth.getPrincipal();
        NotificationDto notification = notificationService.markNotificationAsRead(notificationId, user.getId());
        return ResponseEntity.ok(ApiResponse.success("Bildirim okundu olarak işaretlendi", notification));
    }
    
    /**
     * Tüm bildirimleri okundu olarak işaretler
     * 
     * @param auth Kullanıcı kimlik doğrulaması
     * @return Okunmamış bildirim sayısı
     */
    @PostMapping("/mark-all-as-read")
    public ResponseEntity<ApiResponse<Integer>> markAllAsRead(Authentication auth) {
        User user = (User) auth.getPrincipal();
        int unreadCount = notificationService.markAllNotificationsAsRead(user.getId());
        return ResponseEntity.ok(ApiResponse.success("Tüm bildirimler okundu olarak işaretlendi", unreadCount));
    }
    
    /**
     * Bir bildirimi siler
     * 
     * @param notificationId Bildirim ID
     * @param auth Kullanıcı kimlik doğrulaması
     * @return Başarı durumu
     */
    @DeleteMapping("/{notificationId}")
    public ResponseEntity<ApiResponse<Void>> deleteNotification(
            @PathVariable Long notificationId, Authentication auth) {
        User user = (User) auth.getPrincipal();
        notificationService.deleteNotification(notificationId, user.getId());
        return ResponseEntity.ok(ApiResponse.success("Bildirim silindi", null));
    }
} 