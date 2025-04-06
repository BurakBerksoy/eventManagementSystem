package com.example.cmManagementSystem.service;

import com.example.cmManagementSystem.entity.Event;
import com.example.cmManagementSystem.entity.User;
import com.example.cmManagementSystem.repository.EventRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;

/**
 * Etkinlik yetkilendirme işlemlerini yöneten servis
 */
public interface EventAuthService {
    
    /**
     * Kullanıcının belirtilen etkinliği oluşturan kişi olup olmadığını kontrol eder
     *
     * @param userId Kullanıcı ID
     * @param eventId Etkinlik ID
     * @return Kullanıcı bu etkinliği oluşturan kişi mi
     */
    boolean isEventCreatedByUser(Long userId, Long eventId);
    
    /**
     * Kullanıcının belirtilen etkinliğe katılımcı olup olmadığını kontrol eder
     *
     * @param userId Kullanıcı ID
     * @param eventId Etkinlik ID
     * @return Kullanıcı bu etkinliğin katılımcısı mı
     */
    boolean isEventParticipant(Long userId, Long eventId);
    
    /**
     * Kullanıcının belirtilen etkinliğin düzenleyicisi olan kulübün başkanı olup olmadığını kontrol eder
     *
     * @param userId Kullanıcı ID
     * @param eventId Etkinlik ID
     * @return Kullanıcı bu etkinliği düzenleyen kulübün başkanı mı
     */
    boolean isEventOrganizedByUsersClub(Long userId, Long eventId);
} 