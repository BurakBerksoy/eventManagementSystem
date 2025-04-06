package com.example.cmManagementSystem.service;

import com.example.cmManagementSystem.entity.Club;
import com.example.cmManagementSystem.entity.User;
import com.example.cmManagementSystem.repository.ClubRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;

/**
 * Kulüp yetkilendirme işlemlerini yöneten servis
 */
public interface ClubAuthService {
    
    /**
     * Kullanıcının belirtilen kulübün başkanı olup olmadığını kontrol eder
     *
     * @param userId Kullanıcı ID
     * @param clubId Kulüp ID
     * @return Kullanıcı bu kulübün başkanı mı
     */
    boolean isPresidentOfClub(Long userId, Long clubId);
    
    /**
     * Kullanıcının belirtilen kulübün üyesi olup olmadığını kontrol eder
     *
     * @param userId Kullanıcı ID
     * @param clubId Kulüp ID
     * @return Kullanıcı bu kulübün üyesi mi
     */
    boolean isMemberOfClub(Long userId, Long clubId);
    
    /**
     * Kullanıcının belirtilen kulüpte belirtilen role sahip olup olmadığını kontrol eder
     *
     * @param userId Kullanıcı ID
     * @param clubId Kulüp ID
     * @param role Kontrol edilecek rol
     * @return Kullanıcı bu kulüpte belirtilen role sahip mi
     */
    boolean hasRoleInClub(Long userId, Long clubId, String role);
} 