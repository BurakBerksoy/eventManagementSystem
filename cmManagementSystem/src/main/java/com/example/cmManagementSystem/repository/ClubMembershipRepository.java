package com.example.cmManagementSystem.repository;

import com.example.cmManagementSystem.entity.ClubMembership;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ClubMembershipRepository extends JpaRepository<ClubMembership, Long> {
    
    List<ClubMembership> findByUserId(Long userId);
    
    List<ClubMembership> findByClubId(Long clubId);
    
    List<ClubMembership> findByClubIdAndActive(Long clubId, boolean active);
    
    List<ClubMembership> findByUserIdAndActive(Long userId, boolean active);
    
    Optional<ClubMembership> findByClubIdAndUserId(Long clubId, Long userId);
    
    /**
     * Kullanıcı ve kulüp ID'sine göre tüm üyelikleri getirir
     * 
     * @param userId Kullanıcı ID
     * @param clubId Kulüp ID
     * @return Üyelik listesi
     */
    List<ClubMembership> findByUserIdAndClubId(Long userId, Long clubId);
    
    @Query("SELECT cm FROM ClubMembership cm JOIN FETCH cm.club c JOIN FETCH cm.user u WHERE cm.user.id = :userId")
    List<ClubMembership> findByUserIdWithClubAndUser(@Param("userId") Long userId);
    
    @Query("SELECT cm FROM ClubMembership cm WHERE cm.club.id = :clubId AND cm.role = :role AND cm.active = true")
    List<ClubMembership> findByClubIdAndRole(@Param("clubId") Long clubId, @Param("role") String role);
    
    @Query("SELECT COUNT(cm) FROM ClubMembership cm WHERE cm.club.id = :clubId AND cm.active = true")
    int countActiveMembers(@Param("clubId") Long clubId);
} 