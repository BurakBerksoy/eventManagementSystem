package com.example.cmManagementSystem.repository;

import com.example.cmManagementSystem.entity.Report;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ReportRepository extends JpaRepository<Report, Long> {
    
    List<Report> findByType(Report.ReportType type);
    
    List<Report> findByClubId(Long clubId);
    
    List<Report> findByEventId(Long eventId);
    
    List<Report> findByCreatedById(Long createdById);
    
    Page<Report> findByIsPublic(Boolean isPublic, Pageable pageable);
    
    List<Report> findByIsScheduled(Boolean isScheduled);
    
    @Query("SELECT r FROM Report r WHERE r.isScheduled = true AND r.nextRunDate <= ?1")
    List<Report> findScheduledReportsToRun(LocalDateTime now);
    
    @Query("SELECT r FROM Report r WHERE " +
           "(LOWER(r.title) LIKE LOWER(CONCAT('%', ?1, '%')) OR " +
           "LOWER(r.description) LIKE LOWER(CONCAT('%', ?1, '%')))")
    Page<Report> searchByKeyword(String keyword, Pageable pageable);
} 