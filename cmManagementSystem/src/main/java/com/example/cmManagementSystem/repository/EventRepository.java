package com.example.cmManagementSystem.repository;

import com.example.cmManagementSystem.entity.Event;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface EventRepository extends JpaRepository<Event, Long> {
    
    Page<Event> findByStatus(Event.EventStatus status, Pageable pageable);
    
    Page<Event> findByCategory(String category, Pageable pageable);
    
    Page<Event> findByClubId(Long clubId, Pageable pageable);
    
    @Query("SELECT e FROM Event e WHERE e.startDate >= :now AND e.status = 'UPCOMING' ORDER BY e.startDate ASC")
    List<Event> findUpcomingEvents(@Param("now") LocalDateTime now, Pageable pageable);
    
    @Query("SELECT e FROM Event e WHERE e.startDate < :now OR e.status = 'COMPLETED' ORDER BY e.startDate DESC")
    List<Event> findCompletedEvents(@Param("now") LocalDateTime now, Pageable pageable);
    
    @Query("SELECT e FROM Event e WHERE (LOWER(e.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(e.description) LIKE LOWER(CONCAT('%', :keyword, '%'))) AND e.status = :status")
    Page<Event> searchEventsByKeyword(@Param("keyword") String keyword, @Param("status") Event.EventStatus status, Pageable pageable);
    
    @Query("SELECT e FROM Event e WHERE e.startDate BETWEEN :startDate AND :endDate")
    List<Event> findEventsBetweenDates(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);
    
    @Query("SELECT e FROM Event e JOIN FETCH e.club c WHERE e.id = :id")
    Event findByIdWithClub(@Param("id") Long id);
} 