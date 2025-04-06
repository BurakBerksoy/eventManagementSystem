package com.example.cmManagementSystem.repository;

import com.example.cmManagementSystem.entity.Sponsor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SponsorRepository extends JpaRepository<Sponsor, Long> {
    
    List<Sponsor> findByName(String name);
    
    List<Sponsor> findByType(Sponsor.SponsorType type);
    
    List<Sponsor> findByLevel(Sponsor.SponsorLevel level);
    
    @Query("SELECT s FROM Sponsor s JOIN s.clubs c WHERE c.id = ?1")
    List<Sponsor> findByClubId(Long clubId);
    
    @Query("SELECT s FROM Sponsor s JOIN s.events e WHERE e.id = ?1")
    List<Sponsor> findByEventId(Long eventId);
    
    Page<Sponsor> findByTypeAndLevel(Sponsor.SponsorType type, Sponsor.SponsorLevel level, Pageable pageable);
    
    @Query("SELECT DISTINCT s FROM Sponsor s JOIN s.clubs c WHERE c.id IN ?1")
    List<Sponsor> findByClubIds(List<Long> clubIds);
} 