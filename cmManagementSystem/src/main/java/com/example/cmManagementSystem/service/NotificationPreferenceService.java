package com.example.cmManagementSystem.service;

import com.example.cmManagementSystem.dto.NotificationPreferenceDto;
import com.example.cmManagementSystem.entity.NotificationPreference;

public interface NotificationPreferenceService {
    
    /**
     * Kullanıcı ID'ye göre bildirim tercihlerini getirir
     * 
     * @param userId Kullanıcı ID
     * @return Bildirim tercihleri
     */
    NotificationPreferenceDto findByUserId(Long userId);
    
    /**
     * Kullanıcı için varsayılan bildirim tercihleri oluşturur
     * 
     * @param userId Kullanıcı ID
     * @return Oluşturulan bildirim tercihleri
     */
    NotificationPreferenceDto createDefaultPreferences(Long userId);
    
    /**
     * Bildirim tercihlerini günceller
     * 
     * @param userId Kullanıcı ID
     * @param preferencesDto Güncellenecek bildirim tercihleri
     * @return Güncellenen bildirim tercihleri
     */
    NotificationPreferenceDto updatePreferences(Long userId, NotificationPreferenceDto preferencesDto);
    
    /**
     * E-posta bildirimlerini etkinleştirir/devre dışı bırakır
     * 
     * @param userId Kullanıcı ID
     * @param enabled Etkinleştirme durumu
     * @return Güncellenen bildirim tercihleri
     */
    NotificationPreferenceDto toggleEmailNotifications(Long userId, boolean enabled);
    
    /**
     * Sistem bildirimlerini etkinleştirir/devre dışı bırakır
     * 
     * @param userId Kullanıcı ID
     * @param enabled Etkinleştirme durumu
     * @return Güncellenen bildirim tercihleri
     */
    NotificationPreferenceDto toggleSystemNotifications(Long userId, boolean enabled);
    
    /**
     * SMS bildirimlerini etkinleştirir/devre dışı bırakır
     * 
     * @param userId Kullanıcı ID
     * @param enabled Etkinleştirme durumu
     * @return Güncellenen bildirim tercihleri
     */
    NotificationPreferenceDto toggleSmsNotifications(Long userId, boolean enabled);
    
    /**
     * E-posta bildirim sıklığını günceller
     * 
     * @param userId Kullanıcı ID
     * @param frequency Bildirim sıklığı
     * @return Güncellenen bildirim tercihleri
     */
    NotificationPreferenceDto updateEmailFrequency(Long userId, NotificationPreference.NotificationFrequency frequency);
    
    /**
     * Sistem bildirim sıklığını günceller
     * 
     * @param userId Kullanıcı ID
     * @param frequency Bildirim sıklığı
     * @return Güncellenen bildirim tercihleri
     */
    NotificationPreferenceDto updateSystemFrequency(Long userId, NotificationPreference.NotificationFrequency frequency);
    
    /**
     * Sessiz saatleri etkinleştirir/devre dışı bırakır
     * 
     * @param userId Kullanıcı ID
     * @param enabled Etkinleştirme durumu
     * @return Güncellenen bildirim tercihleri
     */
    NotificationPreferenceDto toggleQuietHours(Long userId, boolean enabled);
    
    /**
     * Bildirim tercihlerini siler
     * 
     * @param userId Kullanıcı ID
     */
    void deletePreferences(Long userId);
} 