package com.example.cmManagementSystem.service;

import com.example.cmManagementSystem.dto.ClubDto;
import com.example.cmManagementSystem.dto.UserDto;
import com.example.cmManagementSystem.entity.User;

import java.util.List;

public interface ClubService {
    
    /**
     * Tüm kulüpleri listeler
     *
     * @return Kulüp listesi
     */
    List<ClubDto> findAll();
    
    /**
     * ID'ye göre kulüp bulur
     *
     * @param id Kulüp ID
     * @return Kulüp
     */
    ClubDto findById(Long id);
    
    /**
     * İsme göre kulüp bulur
     *
     * @param name Kulüp adı
     * @return Kulüp
     */
    ClubDto findByName(String name);
    
    /**
     * Yeni bir kulüp oluşturur
     *
     * @param clubDto Kulüp bilgileri
     * @return Oluşturulan kulüp
     */
    ClubDto createClub(ClubDto clubDto);
    
    /**
     * Kulüp bilgilerini günceller
     *
     * @param id Kulüp ID
     * @param clubDto Güncellenecek kulüp bilgileri
     * @return Güncellenen kulüp
     */
    ClubDto updateClub(Long id, ClubDto clubDto);
    
    /**
     * Kulübü siler
     *
     * @param id Silinecek kulüp ID
     */
    void deleteClub(Long id);
    
    /**
     * Kulüp başkanını değiştirir (sadece ADMIN tarafından yapılabilir)
     *
     * @param clubId Kulüp ID
     * @param newPresidentId Yeni başkan ID
     * @return Güncellenen kulüp
     */
    ClubDto changeClubPresident(Long clubId, Long newPresidentId);
    
    /**
     * Kulüp üyelerini listeler
     *
     * @param clubId Kulüp ID
     * @return Üye listesi
     */
    List<UserDto> getClubMembers(Long clubId);
    
    /**
     * Kulübe üye ekler
     *
     * @param clubId Kulüp ID
     * @param userId Eklenecek üye ID
     * @param role Üye rolü
     * @return Eklenen üye
     */
    UserDto addClubMember(Long clubId, Long userId, User.Role role);
    
    /**
     * Kulüp üyesinin rolünü değiştirir
     *
     * @param clubId Kulüp ID
     * @param userId Üye ID
     * @param newRole Yeni rol
     * @return Güncellenen üye
     */
    UserDto changeClubMemberRole(Long clubId, Long userId, User.Role newRole);
    
    /**
     * Kulüpten üye çıkarır
     *
     * @param clubId Kulüp ID
     * @param userId Çıkarılacak üye ID
     */
    void removeClubMember(Long clubId, Long userId);
    
    /**
     * Kulüp aktiflik durumunu değiştirir
     *
     * @param clubId Kulüp ID
     * @param active Aktif/Pasif durumu
     * @return Güncellenen kulüp
     */
    ClubDto setClubStatus(Long clubId, boolean active);
} 