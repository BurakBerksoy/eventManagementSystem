package com.example.cmManagementSystem.service.impl;

import com.example.cmManagementSystem.entity.Club;
import com.example.cmManagementSystem.entity.ClubMembership;
import com.example.cmManagementSystem.repository.ClubMembershipRepository;
import com.example.cmManagementSystem.repository.ClubRepository;
import com.example.cmManagementSystem.service.ClubAuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ClubAuthServiceImpl implements ClubAuthService {
    
    private final ClubRepository clubRepository;
    private final ClubMembershipRepository clubMembershipRepository;
    
    @Autowired
    public ClubAuthServiceImpl(
            ClubRepository clubRepository,
            ClubMembershipRepository clubMembershipRepository) {
        this.clubRepository = clubRepository;
        this.clubMembershipRepository = clubMembershipRepository;
    }
    
    /**
     * Kullanıcının belirtilen kulübün başkanı olup olmadığını kontrol eder
     *
     * @param userId Kullanıcı ID
     * @param clubId Kulüp ID
     * @return Kullanıcı bu kulübün başkanı mı
     */
    @Override
    public boolean isPresidentOfClub(Long userId, Long clubId) {
        if (userId == null || clubId == null) {
            return false;
        }
        
        // Kulüp kontrol
        Optional<Club> clubOpt = clubRepository.findById(clubId);
        if (!clubOpt.isPresent() || clubOpt.get().getPresident() == null) {
            return false;
        }
        
        return clubOpt.get().getPresident().getId().equals(userId);
    }
    
    /**
     * Kullanıcının belirtilen kulübün üyesi olup olmadığını kontrol eder
     *
     * @param userId Kullanıcı ID
     * @param clubId Kulüp ID
     * @return Kullanıcı bu kulübün üyesi mi
     */
    @Override
    public boolean isMemberOfClub(Long userId, Long clubId) {
        if (userId == null || clubId == null) {
            return false;
        }
        
        // Kulüp üyeliği kontrolü
        List<ClubMembership> memberships = clubMembershipRepository.findByUserIdAndClubId(userId, clubId);
        return memberships.stream().anyMatch(ClubMembership::isActive);
    }
    
    /**
     * Kullanıcının belirtilen kulüpte belirtilen role sahip olup olmadığını kontrol eder
     *
     * @param userId Kullanıcı ID
     * @param clubId Kulüp ID
     * @param role Kontrol edilecek rol
     * @return Kullanıcı bu kulüpte belirtilen role sahip mi
     */
    @Override
    public boolean hasRoleInClub(Long userId, Long clubId, String role) {
        if (userId == null || clubId == null || role == null) {
            return false;
        }
        
        try {
            ClubMembership.Role membershipRole = ClubMembership.Role.valueOf(role.toUpperCase());
            
            // Kulüp üyeliği kontrolü
            List<ClubMembership> memberships = clubMembershipRepository.findByUserIdAndClubId(userId, clubId);
            return memberships.stream()
                    .anyMatch(m -> m.isActive() && m.getRole() == membershipRole);
        } catch (IllegalArgumentException e) {
            // Geçersiz rol
            return false;
        }
    }
} 