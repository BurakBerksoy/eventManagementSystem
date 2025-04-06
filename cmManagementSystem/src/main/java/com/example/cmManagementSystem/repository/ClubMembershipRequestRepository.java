package com.example.cmManagementSystem.repository;

import com.example.cmManagementSystem.entity.ClubMembershipRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ClubMembershipRequestRepository extends JpaRepository<ClubMembershipRequest, Long> {
    
    List<ClubMembershipRequest> findByClubIdAndStatus(Long clubId, ClubMembershipRequest.Status status);
    
    List<ClubMembershipRequest> findByUserIdAndStatus(Long userId, ClubMembershipRequest.Status status);
    
    Optional<ClubMembershipRequest> findByClubIdAndUserIdAndStatus(
            Long clubId, Long userId, ClubMembershipRequest.Status status);
    
    /**
     * Kulüp başkanı veya yöneticisi için bekleyen istekleri getir
     */
    @Query("SELECT r FROM ClubMembershipRequest r " +
            "WHERE r.club.id = :clubId AND r.status = 'PENDING' " +
            "ORDER BY r.requestDate DESC")
    List<ClubMembershipRequest> findPendingRequestsByClubId(@Param("clubId") Long clubId);
    
    /**
     * Kullanıcı için bekleyen istekleri getir
     */
    @Query("SELECT r FROM ClubMembershipRequest r " +
            "WHERE r.user.id = :userId AND r.status = 'PENDING' " +
            "ORDER BY r.requestDate DESC")
    List<ClubMembershipRequest> findPendingRequestsByUserId(@Param("userId") Long userId);
} 