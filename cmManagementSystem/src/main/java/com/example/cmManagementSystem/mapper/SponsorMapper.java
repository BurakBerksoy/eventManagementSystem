package com.example.cmManagementSystem.mapper;

import com.example.cmManagementSystem.dto.SponsorDto;
import com.example.cmManagementSystem.entity.Sponsor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class SponsorMapper {
    
    /**
     * Sponsor entity'sini SponsorDto'ya dönüştürür
     *
     * @param sponsor Sponsor entity
     * @return SponsorDto
     */
    public SponsorDto toDto(Sponsor sponsor) {
        if (sponsor == null) {
            return null;
        }
        
        SponsorDto dto = new SponsorDto();
        dto.setId(sponsor.getId());
        dto.setName(sponsor.getName());
        dto.setDescription(sponsor.getDescription());
        dto.setLogoUrl(sponsor.getLogoUrl());
        dto.setWebsiteUrl(sponsor.getWebsiteUrl());
        dto.setContactPerson(sponsor.getContactPerson());
        dto.setContactEmail(sponsor.getContactEmail());
        dto.setContactPhone(sponsor.getContactPhone());
        dto.setAddress(sponsor.getAddress());
        dto.setType(sponsor.getType());
        dto.setLevel(sponsor.getLevel());
        dto.setStartDate(sponsor.getStartDate());
        dto.setEndDate(sponsor.getEndDate());
        
        if (sponsor.getCreatedBy() != null) {
            dto.setCreatedById(sponsor.getCreatedBy().getId());
            dto.setCreatedByName(sponsor.getCreatedBy().getName());
        }
        
        // Kulüp bilgilerini ayarla
        if (sponsor.getClubs() != null && !sponsor.getClubs().isEmpty()) {
            dto.setClubIds(sponsor.getClubs().stream()
                    .map(club -> club.getId())
                    .collect(Collectors.toList()));
            
            dto.setClubNames(sponsor.getClubs().stream()
                    .map(club -> club.getName())
                    .collect(Collectors.toList()));
        }
        
        // Etkinlik bilgilerini ayarla
        if (sponsor.getEvents() != null && !sponsor.getEvents().isEmpty()) {
            dto.setEventIds(sponsor.getEvents().stream()
                    .map(event -> event.getId())
                    .collect(Collectors.toList()));
            
            dto.setEventNames(sponsor.getEvents().stream()
                    .map(event -> event.getTitle())
                    .collect(Collectors.toList()));
        }
        
        dto.setCreatedAt(sponsor.getCreatedAt());
        dto.setUpdatedAt(sponsor.getUpdatedAt());
        
        return dto;
    }
    
    /**
     * SponsorDto'yu Sponsor entity'ye dönüştürür (yeni entity oluşturur)
     *
     * @param sponsorDto SponsorDto
     * @return Sponsor entity
     */
    public Sponsor toEntity(SponsorDto sponsorDto) {
        if (sponsorDto == null) {
            return null;
        }
        
        Sponsor sponsor = new Sponsor();
        updateEntityFromDto(sponsorDto, sponsor);
        return sponsor;
    }
    
    /**
     * SponsorDto değerlerini mevcut Sponsor entity'sine kopyalar (update)
     *
     * @param sponsorDto Kaynak SponsorDto
     * @param sponsor Hedef Sponsor entity
     */
    public void updateEntityFromDto(SponsorDto sponsorDto, Sponsor sponsor) {
        if (sponsorDto == null || sponsor == null) {
            return;
        }
        
        sponsor.setName(sponsorDto.getName());
        sponsor.setDescription(sponsorDto.getDescription());
        sponsor.setLogoUrl(sponsorDto.getLogoUrl());
        sponsor.setWebsiteUrl(sponsorDto.getWebsiteUrl());
        sponsor.setContactPerson(sponsorDto.getContactPerson());
        sponsor.setContactEmail(sponsorDto.getContactEmail());
        sponsor.setContactPhone(sponsorDto.getContactPhone());
        sponsor.setAddress(sponsorDto.getAddress());
        sponsor.setType(sponsorDto.getType());
        sponsor.setLevel(sponsorDto.getLevel());
        sponsor.setStartDate(sponsorDto.getStartDate());
        sponsor.setEndDate(sponsorDto.getEndDate());
    }
} 