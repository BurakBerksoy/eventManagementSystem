package com.example.cmManagementSystem.mapper;

import com.example.cmManagementSystem.dto.ClubDto;
import com.example.cmManagementSystem.entity.Club;
import com.example.cmManagementSystem.entity.User;
import com.example.cmManagementSystem.repository.ClubMembershipRepository;
import com.example.cmManagementSystem.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class ClubMapper {
    
    private final ClubMembershipRepository clubMembershipRepository;
    private final UserRepository userRepository;
    
    @Autowired
    public ClubMapper(ClubMembershipRepository clubMembershipRepository, UserRepository userRepository) {
        this.clubMembershipRepository = clubMembershipRepository;
        this.userRepository = userRepository;
    }
    
    /**
     * Club entity'sini ClubDto'ya dönüştürür
     *
     * @param club Club entity
     * @return ClubDto
     */
    public ClubDto toDto(Club club) {
        if (club == null) {
            return null;
        }
        
        int membersCount = clubMembershipRepository.countActiveMembers(club.getId());
        
        ClubDto dto = new ClubDto();
        dto.setId(club.getId());
        dto.setName(club.getName());
        dto.setDescription(club.getDescription());
        dto.setLogo(club.getLogoUrl());
        
        if (club.getPresident() != null) {
            dto.setPresidentId(club.getPresident().getId());
            dto.setPresidentName(club.getPresident().getName());
        }
        
        dto.setContactEmail(club.getContactEmail());
        dto.setContactPhone(club.getContactPhone());
        
        if (club.getContactEmail() != null && club.getContactPhone() != null) {
            dto.setContact(club.getContactEmail() + " / " + club.getContactPhone());
        }
        
        dto.setMaxMembers(club.getMaxMembers());
        dto.setFoundationDate(club.getFoundationDate());
        dto.setStatus(club.getStatus());
        dto.setCategory(club.getCategory());
        dto.setActive(club.getStatus() == Club.ClubStatus.ACTIVE);
        dto.setCreatedAt(club.getCreatedAt());
        dto.setUpdatedAt(club.getUpdatedAt());
        dto.setMembersCount(membersCount);
        
        return dto;
    }
    
    /**
     * ClubDto'yu Club entity'ye dönüştürür (yeni entity oluşturur)
     *
     * @param clubDto ClubDto
     * @return Club entity
     */
    public Club toEntity(ClubDto clubDto) {
        if (clubDto == null) {
            return null;
        }
        
        Club club = new Club();
        club.setId(clubDto.getId());
        club.setName(clubDto.getName());
        club.setDescription(clubDto.getDescription());
        club.setLogoUrl(clubDto.getLogo());
        club.setContactEmail(clubDto.getContactEmail());
        club.setContactPhone(clubDto.getContactPhone());
        club.setCategory(clubDto.getCategory());
        club.setFoundationDate(clubDto.getFoundationDate());
        
        // Başkan bilgisini ayarla
        if (clubDto.getPresidentId() != null) {
            userRepository.findById(clubDto.getPresidentId()).ifPresent(club::setPresident);
        }
        
        if (clubDto.getMaxMembers() != null) {
            club.setMaxMembers(clubDto.getMaxMembers());
        }
        
        if (clubDto.getStatus() != null) {
            club.setStatus(clubDto.getStatus());
        } else {
            club.setStatus(clubDto.isActive() ? Club.ClubStatus.ACTIVE : Club.ClubStatus.INACTIVE);
        }
        
        club.setCreatedAt(clubDto.getCreatedAt());
        club.setUpdatedAt(clubDto.getUpdatedAt());
        
        return club;
    }
    
    /**
     * ClubDto değerlerini mevcut Club entity'sine kopyalar (update)
     *
     * @param clubDto Kaynak ClubDto
     * @param club Hedef Club entity
     */
    public void updateEntityFromDto(ClubDto clubDto, Club club) {
        if (clubDto == null || club == null) {
            return;
        }
        
        if (clubDto.getName() != null) {
            club.setName(clubDto.getName());
        }
        
        if (clubDto.getDescription() != null) {
            club.setDescription(clubDto.getDescription());
        }
        
        if (clubDto.getLogo() != null) {
            club.setLogoUrl(clubDto.getLogo());
        }
        
        // Başkan bilgisini güncelle
        if (clubDto.getPresidentId() != null) {
            userRepository.findById(clubDto.getPresidentId()).ifPresent(club::setPresident);
        }
        
        if (clubDto.getContactEmail() != null) {
            club.setContactEmail(clubDto.getContactEmail());
        }
        
        if (clubDto.getContactPhone() != null) {
            club.setContactPhone(clubDto.getContactPhone());
        } else if (clubDto.getContact() != null && club.getContactPhone() == null) {
            club.setContactPhone(clubDto.getContact());
        }
        
        if (clubDto.getCategory() != null) {
            club.setCategory(clubDto.getCategory());
        }
        
        if (clubDto.getFoundationDate() != null) {
            club.setFoundationDate(clubDto.getFoundationDate());
        }
        
        if (clubDto.getMaxMembers() != null) {
            club.setMaxMembers(clubDto.getMaxMembers());
        }
        
        if (clubDto.getStatus() != null) {
            club.setStatus(clubDto.getStatus());
        } else if (club.getStatus() == null) {
            club.setStatus(clubDto.isActive() ? Club.ClubStatus.ACTIVE : Club.ClubStatus.INACTIVE);
        }
    }
} 