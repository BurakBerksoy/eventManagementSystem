package com.example.cmManagementSystem.service;

import com.example.cmManagementSystem.dto.SponsorDto;
import com.example.cmManagementSystem.entity.Sponsor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface SponsorService {
    
    /**
     * Tüm sponsorları sayfalanmış şekilde getirir
     * 
     * @param pageable Sayfalandırma bilgileri
     * @return Sponsor sayfası
     */
    Page<SponsorDto> findAll(Pageable pageable);
    
    /**
     * Tüm sponsorları liste olarak getirir (SponsorController için)
     * 
     * @return Sponsor listesi
     */
    List<SponsorDto> findAll();
    
    /**
     * ID'ye göre sponsor getirir
     * 
     * @param id Sponsor ID
     * @return Sponsor
     */
    SponsorDto findById(Long id);
    
    /**
     * İsme göre sponsorları getirir
     * 
     * @param name Sponsor adı
     * @return Sponsor listesi
     */
    List<SponsorDto> findByName(String name);
    
    /**
     * Tipe göre sponsorları getirir
     * 
     * @param type Sponsor tipi
     * @return Sponsor listesi
     */
    List<SponsorDto> findByType(Sponsor.SponsorType type);
    
    /**
     * Seviyeye göre sponsorları getirir
     * 
     * @param level Sponsor seviyesi
     * @return Sponsor listesi
     */
    List<SponsorDto> findByLevel(Sponsor.SponsorLevel level);
    
    /**
     * Kulübe göre sponsorları getirir
     * 
     * @param clubId Kulüp ID
     * @return Sponsor listesi
     */
    List<SponsorDto> findByClubId(Long clubId);
    
    /**
     * Kulübe göre sponsorları getirir (SponsorController için)
     * 
     * @param clubId Kulüp ID
     * @return Sponsor listesi
     */
    List<SponsorDto> findByClub(Long clubId);
    
    /**
     * Etkinliğe göre sponsorları getirir
     * 
     * @param eventId Etkinlik ID
     * @return Sponsor listesi
     */
    List<SponsorDto> findByEventId(Long eventId);
    
    /**
     * Tipe ve seviyeye göre sponsorları sayfalanmış şekilde getirir
     * 
     * @param type Sponsor tipi
     * @param level Sponsor seviyesi
     * @param pageable Sayfalandırma bilgileri
     * @return Sponsor sayfası
     */
    Page<SponsorDto> findByTypeAndLevel(Sponsor.SponsorType type, Sponsor.SponsorLevel level, Pageable pageable);
    
    /**
     * Yeni sponsor oluşturur
     * 
     * @param sponsorDto Sponsor bilgileri
     * @return Oluşturulan sponsor
     */
    SponsorDto createSponsor(SponsorDto sponsorDto);
    
    /**
     * Sponsor bilgilerini günceller
     * 
     * @param id Sponsor ID
     * @param sponsorDto Güncellenecek bilgiler
     * @return Güncellenen sponsor
     */
    SponsorDto updateSponsor(Long id, SponsorDto sponsorDto);
    
    /**
     * Sponsoru siler
     * 
     * @param id Silinecek sponsor ID
     */
    void deleteSponsor(Long id);
    
    /**
     * Sponsoru bir kulübe ekler
     * 
     * @param sponsorId Sponsor ID
     * @param clubId Kulüp ID
     * @return Güncellenen sponsor
     */
    SponsorDto addSponsorToClub(Long sponsorId, Long clubId);
    
    /**
     * Yeni bir sponsor oluşturur ve bir kulübe ekler
     * 
     * @param clubId Kulüp ID
     * @param sponsorDto Sponsor bilgileri
     * @return Oluşturulan sponsor
     */
    SponsorDto addSponsorToClub(Long clubId, SponsorDto sponsorDto);
    
    /**
     * Sponsoru bir kulüpten çıkarır
     * 
     * @param sponsorId Sponsor ID
     * @param clubId Kulüp ID
     */
    void removeSponsorFromClub(Long sponsorId, Long clubId);
    
    /**
     * Sponsoru bir etkinliğe ekler
     * 
     * @param sponsorId Sponsor ID
     * @param eventId Etkinlik ID
     * @return Güncellenen sponsor
     */
    SponsorDto addSponsorToEvent(Long sponsorId, Long eventId);
    
    /**
     * Sponsoru bir etkinlikten çıkarır
     * 
     * @param sponsorId Sponsor ID
     * @param eventId Etkinlik ID
     */
    void removeSponsorFromEvent(Long sponsorId, Long eventId);
    
    /**
     * Kullanıcının belirtilen ID'li sponsoru yönetme yetkisi olup olmadığını kontrol eder
     * 
     * @param userId Kullanıcı ID
     * @param sponsorId Sponsor ID
     * @return Kullanıcı bu sponsoru yönetebilir mi
     */
    boolean isSponsorOfClub(Long userId, Long sponsorId);
} 