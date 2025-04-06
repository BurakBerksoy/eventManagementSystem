package com.example.cmManagementSystem.service;

import com.example.cmManagementSystem.dto.DigitalAssetDto;
import org.springframework.http.ResponseEntity;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface DigitalAssetService {
    
    // Tüm dijital varlıkları getir
    List<DigitalAssetDto> findAll();
    
    // ID'ye göre dijital varlık getir
    DigitalAssetDto findById(Long id);
    
    // Kulübe ait dijital varlıkları getir
    List<DigitalAssetDto> findByClub(Long clubId);
    
    // Etkinliğe ait dijital varlıkları getir
    List<DigitalAssetDto> findByEvent(Long eventId);
    
    // Tür/kategoriye göre dijital varlıkları getir
    List<DigitalAssetDto> findByType(String type);
    
    // Dosya yükle (Multipart dosya ve Metadata)
    DigitalAssetDto uploadAsset(MultipartFile file, DigitalAssetDto assetDto);
    
    // Etkinliğe dijital varlık ekle
    DigitalAssetDto uploadEventAsset(Long eventId, MultipartFile file, DigitalAssetDto assetDto);
    
    // Kulübe dijital varlık ekle
    DigitalAssetDto uploadClubAsset(Long clubId, MultipartFile file, DigitalAssetDto assetDto);
    
    // Dijital varlık bilgilerini güncelle (sadece metadata, dosya değil)
    DigitalAssetDto updateAsset(Long id, DigitalAssetDto assetDto);
    
    // Dijital varlığı sil
    void deleteAsset(Long id);
    
    // Dosya içeriğini raw olarak getir
    ResponseEntity<byte[]> downloadAsset(Long id);
    
    // Kullanıcının dijital varlık sahibi olup olmadığını kontrol et (güvenlik amaçlı)
    boolean isAssetOwnedByUser(Long userId, Long assetId);
} 