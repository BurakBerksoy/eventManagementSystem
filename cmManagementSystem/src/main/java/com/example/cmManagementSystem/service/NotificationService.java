package com.example.cmManagementSystem.service;

import com.example.cmManagementSystem.dto.NotificationDto;

import java.util.List;

public interface NotificationService {
    
    /**
     * Yeni bir bildirim oluşturur
     *
     * @param title Bildirim başlığı
     * @param message Bildirim mesajı
     * @param type Bildirim tipi
     * @param entityId İlgili entity ID
     * @param userId Alıcı kullanıcı ID
     * @param data Ek veri (JSON formatında)
     * @return Oluşturulan bildirim
     */
    NotificationDto createNotification(String title, String message, String type, Long entityId, Long userId, String data);
    
    /**
     * Bir kullanıcıya ait tüm bildirimleri getirir
     *
     * @param userId Kullanıcı ID
     * @return Bildirimler listesi
     */
    List<NotificationDto> getUserNotifications(Long userId);
    
    /**
     * Bir kullanıcıya ait okunmamış bildirim sayısını getirir
     *
     * @param userId Kullanıcı ID
     * @return Okunmamış bildirim sayısı
     */
    int getUnreadNotificationCount(Long userId);
    
    /**
     * Bir bildirimi okundu olarak işaretler
     *
     * @param notificationId Bildirim ID
     * @param userId Kullanıcı ID
     * @return Güncellenen bildirim
     */
    NotificationDto markNotificationAsRead(Long notificationId, Long userId);
    
    /**
     * Bir kullanıcıya ait tüm bildirimleri okundu olarak işaretler
     *
     * @param userId Kullanıcı ID
     * @return Güncellenen bildirim sayısı
     */
    int markAllNotificationsAsRead(Long userId);
    
    /**
     * Bir bildirimi siler
     *
     * @param notificationId Bildirim ID
     * @param userId Kullanıcı ID
     */
    void deleteNotification(Long notificationId, Long userId);
} 