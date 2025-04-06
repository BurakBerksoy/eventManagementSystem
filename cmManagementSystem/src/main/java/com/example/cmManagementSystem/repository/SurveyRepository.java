package com.example.cmManagementSystem.repository;

import com.example.cmManagementSystem.entity.Survey;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface SurveyRepository extends JpaRepository<Survey, Long> {
    
    List<Survey> findByClubId(Long clubId);
    
    List<Survey> findByEventId(Long eventId);
    
    List<Survey> findByCreatedById(Long createdById);
    
    Page<Survey> findByIsPublished(Boolean isPublished, Pageable pageable);
    
    @Query("SELECT s FROM Survey s WHERE s.startDate <= ?1 AND (s.endDate IS NULL OR s.endDate >= ?1)")
    List<Survey> findActiveSurveys(LocalDateTime now);
    
    @Query("SELECT s FROM Survey s WHERE s.event.id = ?1 AND s.isPublished = true AND (s.endDate IS NULL OR s.endDate >= ?2)")
    List<Survey> findActiveEventSurveys(Long eventId, LocalDateTime now);
    
    @Query("SELECT s FROM Survey s WHERE s.club.id = ?1 AND s.isPublished = true AND (s.endDate IS NULL OR s.endDate >= ?2)")
    List<Survey> findActiveClubSurveys(Long clubId, LocalDateTime now);
} 