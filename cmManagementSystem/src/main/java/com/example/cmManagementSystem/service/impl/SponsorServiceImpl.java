package com.example.cmManagementSystem.service.impl;

import com.example.cmManagementSystem.dto.SponsorDto;
import com.example.cmManagementSystem.entity.Club;
import com.example.cmManagementSystem.entity.Event;
import com.example.cmManagementSystem.entity.Sponsor;
import com.example.cmManagementSystem.entity.User;
import com.example.cmManagementSystem.exception.ResourceNotFoundException;
import com.example.cmManagementSystem.mapper.SponsorMapper;
import com.example.cmManagementSystem.repository.ClubRepository;
import com.example.cmManagementSystem.repository.EventRepository;
import com.example.cmManagementSystem.repository.SponsorRepository;
import com.example.cmManagementSystem.repository.UserRepository;
import com.example.cmManagementSystem.service.SponsorService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class SponsorServiceImpl implements SponsorService {

    private final SponsorRepository sponsorRepository;
    private final ClubRepository clubRepository;
    private final EventRepository eventRepository;
    private final UserRepository userRepository;
    private final SponsorMapper sponsorMapper;

    @Override
    @Transactional(readOnly = true)
    public Page<SponsorDto> findAll(Pageable pageable) {
        return sponsorRepository.findAll(pageable)
                .map(sponsorMapper::toDto);
    }

    @Override
    @Transactional(readOnly = true)
    public List<SponsorDto> findAll() {
        return sponsorRepository.findAll()
                .stream()
                .map(sponsorMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public SponsorDto findById(Long id) {
        Sponsor sponsor = sponsorRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Sponsor", "id", id));
        return sponsorMapper.toDto(sponsor);
    }

    @Override
    @Transactional(readOnly = true)
    public List<SponsorDto> findByName(String name) {
        return sponsorRepository.findByName(name)
                .stream()
                .map(sponsorMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<SponsorDto> findByType(Sponsor.SponsorType type) {
        return sponsorRepository.findByType(type)
                .stream()
                .map(sponsorMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<SponsorDto> findByLevel(Sponsor.SponsorLevel level) {
        return sponsorRepository.findByLevel(level)
                .stream()
                .map(sponsorMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<SponsorDto> findByClubId(Long clubId) {
        return sponsorRepository.findByClubId(clubId)
                .stream()
                .map(sponsorMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<SponsorDto> findByClub(Long clubId) {
        // Controller için alias, aynı findByClubId fonksiyonunu kullanır
        return findByClubId(clubId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<SponsorDto> findByEventId(Long eventId) {
        return sponsorRepository.findByEventId(eventId)
                .stream()
                .map(sponsorMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public Page<SponsorDto> findByTypeAndLevel(Sponsor.SponsorType type, Sponsor.SponsorLevel level, Pageable pageable) {
        return sponsorRepository.findByTypeAndLevel(type, level, pageable)
                .map(sponsorMapper::toDto);
    }

    @Override
    @Transactional
    public SponsorDto createSponsor(SponsorDto sponsorDto) {
        Sponsor sponsor = sponsorMapper.toEntity(sponsorDto);
        
        // Oluşturan kullanıcıyı ayarla (eğer varsa)
        if (sponsorDto.getCreatedById() != null) {
            User creator = userRepository.findById(sponsorDto.getCreatedById())
                    .orElseThrow(() -> new ResourceNotFoundException("User", "id", sponsorDto.getCreatedById()));
            sponsor.setCreatedBy(creator);
        }
        
        Sponsor savedSponsor = sponsorRepository.save(sponsor);
        return sponsorMapper.toDto(savedSponsor);
    }

    @Override
    @Transactional
    public SponsorDto updateSponsor(Long id, SponsorDto sponsorDto) {
        Sponsor sponsor = sponsorRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Sponsor", "id", id));
        
        sponsorMapper.updateEntityFromDto(sponsorDto, sponsor);
        Sponsor updatedSponsor = sponsorRepository.save(sponsor);
        return sponsorMapper.toDto(updatedSponsor);
    }

    @Override
    @Transactional
    public void deleteSponsor(Long id) {
        Sponsor sponsor = sponsorRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Sponsor", "id", id));
        
        // Kulüplerden ve etkinliklerden sponsoru kaldır
        for (Club club : sponsor.getClubs()) {
            club.getSponsors().remove(sponsor);
        }
        
        for (Event event : sponsor.getEvents()) {
            event.getSponsors().remove(sponsor);
        }
        
        sponsorRepository.delete(sponsor);
    }

    @Override
    @Transactional
    public SponsorDto addSponsorToClub(Long sponsorId, Long clubId) {
        Sponsor sponsor = sponsorRepository.findById(sponsorId)
                .orElseThrow(() -> new ResourceNotFoundException("Sponsor", "id", sponsorId));
                
        Club club = clubRepository.findById(clubId)
                .orElseThrow(() -> new ResourceNotFoundException("Club", "id", clubId));
        
        club.getSponsors().add(sponsor);
        sponsor.getClubs().add(club);
        
        Sponsor updatedSponsor = sponsorRepository.save(sponsor);
        clubRepository.save(club);
        
        return sponsorMapper.toDto(updatedSponsor);
    }

    @Override
    @Transactional
    public SponsorDto addSponsorToClub(Long clubId, SponsorDto sponsorDto) {
        // Önce sponsoru oluştur
        Sponsor sponsor = sponsorMapper.toEntity(sponsorDto);
        
        if (sponsorDto.getCreatedById() != null) {
            User creator = userRepository.findById(sponsorDto.getCreatedById())
                    .orElseThrow(() -> new ResourceNotFoundException("User", "id", sponsorDto.getCreatedById()));
            sponsor.setCreatedBy(creator);
        }
        
        Sponsor savedSponsor = sponsorRepository.save(sponsor);
        
        // Sonra kulübe ekle
        Club club = clubRepository.findById(clubId)
                .orElseThrow(() -> new ResourceNotFoundException("Club", "id", clubId));
        
        club.getSponsors().add(savedSponsor);
        savedSponsor.getClubs().add(club);
        
        Sponsor updatedSponsor = sponsorRepository.save(savedSponsor);
        clubRepository.save(club);
        
        return sponsorMapper.toDto(updatedSponsor);
    }

    @Override
    @Transactional
    public void removeSponsorFromClub(Long sponsorId, Long clubId) {
        Sponsor sponsor = sponsorRepository.findById(sponsorId)
                .orElseThrow(() -> new ResourceNotFoundException("Sponsor", "id", sponsorId));
                
        Club club = clubRepository.findById(clubId)
                .orElseThrow(() -> new ResourceNotFoundException("Club", "id", clubId));
        
        sponsor.getClubs().remove(club);
        club.getSponsors().remove(sponsor);
        
        sponsorRepository.save(sponsor);
        clubRepository.save(club);
    }

    @Override
    @Transactional
    public SponsorDto addSponsorToEvent(Long sponsorId, Long eventId) {
        Sponsor sponsor = sponsorRepository.findById(sponsorId)
                .orElseThrow(() -> new ResourceNotFoundException("Sponsor", "id", sponsorId));
                
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new ResourceNotFoundException("Event", "id", eventId));
        
        event.getSponsors().add(sponsor);
        sponsor.getEvents().add(event);
        
        Sponsor updatedSponsor = sponsorRepository.save(sponsor);
        eventRepository.save(event);
        
        return sponsorMapper.toDto(updatedSponsor);
    }

    @Override
    @Transactional
    public void removeSponsorFromEvent(Long sponsorId, Long eventId) {
        Sponsor sponsor = sponsorRepository.findById(sponsorId)
                .orElseThrow(() -> new ResourceNotFoundException("Sponsor", "id", sponsorId));
                
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new ResourceNotFoundException("Event", "id", eventId));
        
        sponsor.getEvents().remove(event);
        event.getSponsors().remove(sponsor);
        
        sponsorRepository.save(sponsor);
        eventRepository.save(event);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean isSponsorOfClub(Long userId, Long sponsorId) {
        Sponsor sponsor = sponsorRepository.findById(sponsorId)
                .orElseThrow(() -> new ResourceNotFoundException("Sponsor", "id", sponsorId));
                
        // Kullanıcının bu sponsora bağlı kulüplerden birinin başkanı olup olmadığını kontrol et
        return sponsor.getClubs().stream()
                .anyMatch(club -> club.getPresident() != null && 
                                club.getPresident().getId().equals(userId));
    }
} 