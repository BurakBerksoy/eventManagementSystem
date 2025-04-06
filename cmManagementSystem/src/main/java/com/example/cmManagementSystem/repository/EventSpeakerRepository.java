package com.example.cmManagementSystem.repository;

import com.example.cmManagementSystem.entity.EventSpeaker;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EventSpeakerRepository extends JpaRepository<EventSpeaker, Long> {
    
    List<EventSpeaker> findByEventId(Long eventId);
    
    List<EventSpeaker> findByName(String name);
    
    List<EventSpeaker> findByEventIdOrderByOrderIndexAsc(Long eventId);
    
    List<EventSpeaker> findByFeatured(boolean featured);
    
    @Query("SELECT COUNT(es) FROM EventSpeaker es WHERE es.event.id = ?1")
    int countByEventId(Long eventId);
} 