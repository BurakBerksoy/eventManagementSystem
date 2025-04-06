package com.example.cmManagementSystem.repository;

import com.example.cmManagementSystem.entity.EventParticipation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EventParticipationRepository extends JpaRepository<EventParticipation, Long> {
    
    List<EventParticipation> findByUserId(Long userId);
    
    List<EventParticipation> findByEventId(Long eventId);
    
    List<EventParticipation> findByEventIdAndStatus(Long eventId, EventParticipation.ParticipationStatus status);
    
    List<EventParticipation> findByUserIdAndStatus(Long userId, EventParticipation.ParticipationStatus status);
    
    Optional<EventParticipation> findByEventIdAndUserId(Long eventId, Long userId);
    
    @Query("SELECT COUNT(ep) FROM EventParticipation ep WHERE ep.event.id = :eventId AND ep.status IN ('REGISTERED', 'ATTENDED')")
    int countParticipantsByEventId(@Param("eventId") Long eventId);
    
    @Query("SELECT ep FROM EventParticipation ep JOIN FETCH ep.event e JOIN FETCH ep.user u WHERE ep.user.id = :userId")
    List<EventParticipation> findByUserIdWithEventAndUser(@Param("userId") Long userId);
} 