package com.example.cmManagementSystem.repository;

import com.example.cmManagementSystem.entity.DigitalAsset;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DigitalAssetRepository extends JpaRepository<DigitalAsset, Long> {
    
    List<DigitalAsset> findByClubId(Long clubId);
    
    List<DigitalAsset> findByEventId(Long eventId);
    
    List<DigitalAsset> findByCreatedById(Long createdById);
    
    List<DigitalAsset> findByType(DigitalAsset.AssetType type);
    
    List<DigitalAsset> findByCategory(DigitalAsset.AssetCategory category);
    
    Page<DigitalAsset> findByIsPublic(Boolean isPublic, Pageable pageable);
    
    @Query("SELECT da FROM DigitalAsset da WHERE da.club.id = ?1 AND da.category = ?2")
    List<DigitalAsset> findByClubIdAndCategory(Long clubId, DigitalAsset.AssetCategory category);
    
    @Query("SELECT da FROM DigitalAsset da WHERE da.event.id = ?1 AND da.category = ?2")
    List<DigitalAsset> findByEventIdAndCategory(Long eventId, DigitalAsset.AssetCategory category);
    
    @Query("SELECT da FROM DigitalAsset da WHERE " +
           "(LOWER(da.title) LIKE LOWER(CONCAT('%', ?1, '%')) OR " +
           "LOWER(da.description) LIKE LOWER(CONCAT('%', ?1, '%')) OR " +
           "LOWER(da.tags) LIKE LOWER(CONCAT('%', ?1, '%')))")
    Page<DigitalAsset> searchByKeyword(String keyword, Pageable pageable);
} 