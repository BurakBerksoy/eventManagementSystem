package com.example.cmManagementSystem.service;

import com.example.cmManagementSystem.dto.ClubMembershipDto;
import com.example.cmManagementSystem.dto.ClubMembershipRequestDto;

import java.util.List;

public interface ClubMembershipService {
    
    /**
     * Kulübe katılma isteği oluşturur
     *
     * @param clubId Kulüp ID
     * @param userId Kullanıcı ID
     * @param message İstek mesajı
     * @return Oluşturulan istek
     */
    ClubMembershipDto createMembershipRequest(Long clubId, Long userId, String message);
    
    /**
     * Kulüp üyelik isteğini onaylar
     *
     * @param requestId İstek ID
     * @param processorId İşlemi yapan kullanıcı ID
     * @return Oluşturulan üyelik
     */
    ClubMembershipDto approveMembershipRequest(Long requestId, Long processorId);
    
    /**
     * Kulüp üyelik isteğini reddeder
     *
     * @param requestId İstek ID
     * @param processorId İşlemi yapan kullanıcı ID
     */
    void rejectMembershipRequest(Long requestId, Long processorId);
    
    /**
     * Kulübün bekleyen üyelik isteklerini getirir
     *
     * @param clubId Kulüp ID
     * @param userId İsteği yapan kullanıcı ID (yetki kontrolü için)
     * @return Bekleyen istekler
     */
    List<ClubMembershipRequestDto> getPendingMembershipRequests(Long clubId, Long userId);
    
    /**
     * Kullanıcının kulüpten ayrılmasını sağlar
     *
     * @param clubId Kulüp ID
     * @param userId Kullanıcı ID
     */
    void leaveClub(Long clubId, Long userId);
    
    /**
     * Kulüp üyesinin rolünü değiştirir
     *
     * @param clubId Kulüp ID
     * @param memberId Üye ID
     * @param newRole Yeni rol
     * @param changerId Değişikliği yapan kullanıcı ID
     * @return Güncellenen üyelik
     */
    ClubMembershipDto changeMemberRole(Long clubId, Long memberId, String newRole, Long changerId);
    
    /**
     * Kullanıcının belirli bir kulüpteki üyelik bilgisini getirir
     *
     * @param clubId Kulüp ID
     * @param userId Kullanıcı ID
     * @return Üyelik bilgisi (eğer üye değilse null)
     */
    ClubMembershipDto getMembershipInfo(Long clubId, Long userId);
} 