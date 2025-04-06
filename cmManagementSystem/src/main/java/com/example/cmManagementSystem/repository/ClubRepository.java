package com.example.cmManagementSystem.repository;

import com.example.cmManagementSystem.entity.Club;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ClubRepository extends JpaRepository<Club, Long> {
    
    List<Club> findByStatus(Club.ClubStatus status);
    
    List<Club> findByCategory(String category);
    
    Optional<Club> findByName(String name);
    
    @Query("SELECT c FROM Club c WHERE c.status = 'ACTIVE' ORDER BY SIZE(c.memberships) DESC")
    List<Club> findTopActiveClubsByMemberCount();
    
    @Query("SELECT c FROM Club c JOIN c.events e WHERE e.status = 'UPCOMING' GROUP BY c ORDER BY COUNT(e) DESC")
    List<Club> findTopClubsByUpcomingEvents();
    
    @Query("SELECT c FROM Club c JOIN FETCH c.president p WHERE c.id = ?1")
    Optional<Club> findByIdWithPresident(Long id);
} 