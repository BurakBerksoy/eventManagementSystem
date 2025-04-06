package com.example.cmManagementSystem.repository;

import com.example.cmManagementSystem.entity.EventProgram;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface EventProgramRepository extends JpaRepository<EventProgram, Long> {
    
    List<EventProgram> findByEventId(Long eventId);
    
    List<EventProgram> findByEventIdOrderByStartTimeAsc(Long eventId);
    
    List<EventProgram> findByEventIdOrderByOrderIndexAsc(Long eventId);
    
    List<EventProgram> findByEventIdAndType(Long eventId, EventProgram.ProgramType type);
    
    List<EventProgram> findBySpeakerId(Long speakerId);
    
    @Query("SELECT ep FROM EventProgram ep WHERE ep.event.id = ?1 AND " +
           "ep.startTime BETWEEN ?2 AND ?3 ORDER BY ep.startTime ASC")
    List<EventProgram> findByEventIdAndTimeRange(Long eventId, LocalDateTime startTime, LocalDateTime endTime);
    
    @Query("SELECT COUNT(ep) FROM EventProgram ep WHERE ep.event.id = ?1")
    int countByEventId(Long eventId);
} 