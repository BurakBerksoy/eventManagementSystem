package com.example.cmManagementSystem.repository;

import com.example.cmManagementSystem.entity.WaitingList;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface WaitingListRepository extends JpaRepository<WaitingList, Long> {
    
    List<WaitingList> findByEventId(Long eventId);
    
    List<WaitingList> findByEventIdAndStatus(Long eventId, WaitingList.WaitingStatus status);
    
    List<WaitingList> findByUserId(Long userId);
    
    Optional<WaitingList> findByEventIdAndUserId(Long eventId, Long userId);
    
    @Query("SELECT wl FROM WaitingList wl WHERE wl.event.id = ?1 ORDER BY wl.position ASC")
    List<WaitingList> findByEventIdOrderByPositionAsc(Long eventId);
    
    @Query("SELECT COUNT(wl) FROM WaitingList wl WHERE wl.event.id = ?1 AND wl.status = ?2")
    Integer countByEventIdAndStatus(Long eventId, WaitingList.WaitingStatus status);
    
    List<WaitingList> findByNotificationSentAndStatus(Boolean notificationSent, WaitingList.WaitingStatus status);
    
    List<WaitingList> findByStatusAndResponseDeadlineBefore(WaitingList.WaitingStatus status, LocalDateTime deadline);
} 