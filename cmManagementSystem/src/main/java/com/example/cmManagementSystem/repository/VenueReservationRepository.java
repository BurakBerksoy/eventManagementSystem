package com.example.cmManagementSystem.repository;

import com.example.cmManagementSystem.entity.VenueReservation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface VenueReservationRepository extends JpaRepository<VenueReservation, Long> {
    
    List<VenueReservation> findByVenueId(Long venueId);
    
    List<VenueReservation> findByEventId(Long eventId);
    
    List<VenueReservation> findByClubId(Long clubId);
    
    List<VenueReservation> findByStatus(VenueReservation.ReservationStatus status);
    
    @Query("SELECT vr FROM VenueReservation vr WHERE vr.venue.id = ?1 AND " +
           "((vr.startTime <= ?3 AND vr.endTime >= ?2) OR " +
           "(vr.startTime >= ?2 AND vr.startTime <= ?3)) AND " +
           "vr.status NOT IN ('REJECTED', 'CANCELLED')")
    List<VenueReservation> findOverlappingReservations(Long venueId, LocalDateTime startTime, LocalDateTime endTime);
    
    @Query("SELECT vr FROM VenueReservation vr WHERE vr.venue.id = ?1 AND " +
           "vr.startTime >= ?2 AND vr.endTime <= ?3")
    List<VenueReservation> findReservationsInPeriod(Long venueId, LocalDateTime startTime, LocalDateTime endTime);
    
    Optional<VenueReservation> findByReservationCode(String reservationCode);
} 