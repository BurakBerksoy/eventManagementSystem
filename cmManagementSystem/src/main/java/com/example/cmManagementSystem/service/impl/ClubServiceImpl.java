package com.example.cmManagementSystem.service.impl;

import com.example.cmManagementSystem.dto.ClubDto;
import com.example.cmManagementSystem.dto.UserDto;
import com.example.cmManagementSystem.entity.Club;
import com.example.cmManagementSystem.entity.ClubMembership;
import com.example.cmManagementSystem.entity.User;
import com.example.cmManagementSystem.mapper.ClubMapper;
import com.example.cmManagementSystem.mapper.UserMapper;
import com.example.cmManagementSystem.repository.ClubMembershipRepository;
import com.example.cmManagementSystem.repository.ClubRepository;
import com.example.cmManagementSystem.repository.UserRepository;
import com.example.cmManagementSystem.service.ClubService;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class ClubServiceImpl implements ClubService {
    
    private final ClubRepository clubRepository;
    private final UserRepository userRepository;
    private final ClubMembershipRepository clubMembershipRepository;
    private final ClubMapper clubMapper;
    private final UserMapper userMapper;
    
    @Autowired
    public ClubServiceImpl(
            ClubRepository clubRepository,
            UserRepository userRepository,
            ClubMembershipRepository clubMembershipRepository,
            ClubMapper clubMapper,
            UserMapper userMapper) {
        this.clubRepository = clubRepository;
        this.userRepository = userRepository;
        this.clubMembershipRepository = clubMembershipRepository;
        this.clubMapper = clubMapper;
        this.userMapper = userMapper;
    }
    
    @Override
    public List<ClubDto> findAll() {
        return clubRepository.findAll().stream()
                .map(clubMapper::toDto)
                .collect(Collectors.toList());
    }
    
    @Override
    public ClubDto findById(Long id) {
        Club club = clubRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Kulüp bulunamadı: " + id));
        return clubMapper.toDto(club);
    }
    
    @Override
    public ClubDto findByName(String name) {
        Club club = clubRepository.findByName(name)
                .orElseThrow(() -> new EntityNotFoundException("Kulüp bulunamadı: " + name));
        return clubMapper.toDto(club);
    }
    
    @Override
    @Transactional
    public ClubDto createClub(ClubDto clubDto) {
        System.out.println("ClubServiceImpl - createClub çağrıldı: " + clubDto.getName());
        System.out.println("ClubServiceImpl - MaxMembers: " + (clubDto.getMaxMembers() != null ? clubDto.getMaxMembers() : "null"));
        System.out.println("ClubServiceImpl - FoundationDate: " + (clubDto.getFoundationDate() != null ? clubDto.getFoundationDate() : "null"));
        
        User president = null;
        
        // Başkan kontrolü
        if (clubDto.getPresidentId() != null) {
            System.out.println("ClubServiceImpl - Başkan ID'si kontrol ediliyor: " + clubDto.getPresidentId());
            president = userRepository.findById(clubDto.getPresidentId())
                    .orElseThrow(() -> new EntityNotFoundException("Kullanıcı bulunamadı: " + clubDto.getPresidentId()));
            System.out.println("ClubServiceImpl - Başkan bulundu: " + president.getEmail());
        } else {
            System.out.println("ClubServiceImpl - Başkan ID'si belirtilmemiş");
        }
        
        Club club = clubMapper.toEntity(clubDto);
        club.setPresident(president);
        club.setStatus(Club.ClubStatus.PENDING); // Yeni kulüpler onay bekliyor olarak oluşturulur
        
        System.out.println("ClubServiceImpl - Kulüp veritabanına kaydediliyor");
        club = clubRepository.save(club);
        System.out.println("ClubServiceImpl - Kulüp kaydedildi, ID: " + club.getId());
        
        // Eğer başkan atandıysa, üyelik oluştur
        if (president != null) {
            System.out.println("ClubServiceImpl - Başkan için üyelik oluşturuluyor");
            ClubMembership membership = ClubMembership.builder()
                    .club(club)
                    .user(president)
                    .role(ClubMembership.Role.PRESIDENT)
                    .joinDate(LocalDateTime.now())
                    .active(true)
                    .build();
            clubMembershipRepository.save(membership);
            
            // Kullanıcının rolünü güncelle
            president.setRole(User.Role.CLUB_PRESIDENT);
            userRepository.save(president);
            System.out.println("ClubServiceImpl - Başkanın rolü güncellendi: " + president.getRole());
        }
        
        ClubDto result = clubMapper.toDto(club);
        System.out.println("ClubServiceImpl - createClub tamamlandı, dönüş değeri oluşturuldu");
        return result;
    }
    
    @Override
    @Transactional
    public ClubDto updateClub(Long id, ClubDto clubDto) {
        Club club = clubRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Kulüp bulunamadı: " + id));
        
        clubMapper.updateEntityFromDto(clubDto, club);
        club = clubRepository.save(club);
        
        return clubMapper.toDto(club);
    }
    
    @Override
    @Transactional
    public void deleteClub(Long id) {
        Club club = clubRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Kulüp bulunamadı: " + id));
        
        // Kulüp üyeliklerini temizle
        clubMembershipRepository.findByClubId(id).forEach(membership -> {
            // Eğer başkan ise rolünü STUDENT'a çevir
            if (membership.getRole() == ClubMembership.Role.PRESIDENT) {
                User president = membership.getUser();
                president.setRole(User.Role.STUDENT);
                userRepository.save(president);
            }
            
            // Üyeliği pasif yap
            membership.setActive(false);
            membership.setLeaveDate(LocalDateTime.now());
            clubMembershipRepository.save(membership);
        });
        
        // Kulübü sil
        clubRepository.delete(club);
    }
    
    @Override
    @Transactional
    public ClubDto changeClubPresident(Long clubId, Long newPresidentId) {
        // Kulüp kontrolü
        Club club = clubRepository.findById(clubId)
                .orElseThrow(() -> new EntityNotFoundException("Kulüp bulunamadı: " + clubId));
        
        // Yeni başkan kontrolü
        User newPresident = userRepository.findById(newPresidentId)
                .orElseThrow(() -> new EntityNotFoundException("Kullanıcı bulunamadı: " + newPresidentId));
        
        // Eski başkan kontrolü
        User oldPresident = club.getPresident();
        if (oldPresident != null) {
            // Eski başkanın üyeliğini bul
            Optional<ClubMembership> oldPresidentMembership = clubMembershipRepository.findByClubIdAndUserId(clubId, oldPresident.getId());
            
            // Eski başkanın rolünü CLUB_MEMBER olarak güncelle
            if (oldPresidentMembership.isPresent()) {
                ClubMembership membership = oldPresidentMembership.get();
                membership.setRole(ClubMembership.Role.MEMBER);
                clubMembershipRepository.save(membership);
                
                // Eğer başka bir kulüpte başkan değilse, kullanıcı rolünü STUDENT olarak güncelle
                if (clubMembershipRepository.findByUserIdAndActive(oldPresident.getId(), true).stream()
                        .noneMatch(m -> m.getRole() == ClubMembership.Role.PRESIDENT)) {
                    oldPresident.setRole(User.Role.STUDENT);
                    userRepository.save(oldPresident);
                }
            }
        }
        
        // Yeni başkanın üyeliğini kontrol et
        Optional<ClubMembership> newPresidentMembership = clubMembershipRepository.findByClubIdAndUserId(clubId, newPresidentId);
        
        if (newPresidentMembership.isPresent()) {
            // Mevcut üyeliğini başkan olarak güncelle
            ClubMembership membership = newPresidentMembership.get();
            membership.setRole(ClubMembership.Role.PRESIDENT);
            clubMembershipRepository.save(membership);
        } else {
            // Yeni üyelik oluştur
            ClubMembership membership = ClubMembership.builder()
                    .club(club)
                    .user(newPresident)
                    .role(ClubMembership.Role.PRESIDENT)
                    .joinDate(LocalDateTime.now())
                    .active(true)
                    .build();
            clubMembershipRepository.save(membership);
        }
        
        // Kullanıcı rolünü güncelle
        newPresident.setRole(User.Role.CLUB_PRESIDENT);
        userRepository.save(newPresident);
        
        // Kulüp başkanını güncelle
        club.setPresident(newPresident);
        club = clubRepository.save(club);
        
        return clubMapper.toDto(club);
    }
    
    @Override
    public List<UserDto> getClubMembers(Long clubId) {
        // Kulüp varlığını kontrol et
        if (!clubRepository.existsById(clubId)) {
            throw new EntityNotFoundException("Kulüp bulunamadı: " + clubId);
        }
        
        // Aktif üyeleri getir
        return clubMembershipRepository.findByClubIdAndActive(clubId, true).stream()
                .map(membership -> userMapper.toDto(membership.getUser()))
                .collect(Collectors.toList());
    }
    
    // Kulüp üye rolleri eşleştirme
    private ClubMembership.Role mapUserRoleToClubRole(User.Role userRole) {
        switch (userRole) {
            case CLUB_PRESIDENT:
                return ClubMembership.Role.PRESIDENT;
            case CLUB_ACCOUNTANT:
                return ClubMembership.Role.ACCOUNTANT;
            case CLUB_EXTERNAL_AFFAIRS:
            case CLUB_CATERING:
            case CLUB_DESIGN:
            case CLUB_REPORTER:
                return ClubMembership.Role.COORDINATOR;
            case CLUB_MEMBER:
            case STUDENT:
            case ADMIN:
            default:
                return ClubMembership.Role.MEMBER;
        }
    }
    
    // Kulüp rollerini doğrulama
    private void validateClubRole(User.Role role) {
        if (role != User.Role.CLUB_MEMBER && 
            role != User.Role.CLUB_PRESIDENT && 
            role != User.Role.CLUB_ACCOUNTANT && 
            role != User.Role.CLUB_EXTERNAL_AFFAIRS && 
            role != User.Role.CLUB_CATERING && 
            role != User.Role.CLUB_DESIGN && 
            role != User.Role.CLUB_REPORTER) {
            throw new IllegalArgumentException("Geçersiz kulüp rolü: " + role);
        }
    }
    
    @Override
    @Transactional
    public UserDto addClubMember(Long clubId, Long userId, User.Role role) {
        // Kulüp kontrolü
        Club club = clubRepository.findById(clubId)
                .orElseThrow(() -> new EntityNotFoundException("Kulüp bulunamadı: " + clubId));
        
        // Kullanıcı kontrolü
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("Kullanıcı bulunamadı: " + userId));
        
        // Rol kontrolü - sadece kulüp rollerini kabul et
        validateClubRole(role);
        
        // User.Role'dan ClubMembership.Role'a dönüştür
        ClubMembership.Role membershipRole = mapUserRoleToClubRole(role);
        
        // Başkan rolü kontrolü - her kulüpte sadece bir başkan olabilir
        if (role == User.Role.CLUB_PRESIDENT) {
            // Mevcut başkan varsa hata döndür
            if (club.getPresident() != null && !club.getPresident().getId().equals(userId)) {
                throw new IllegalStateException("Kulübün zaten bir başkanı var. Önce mevcut başkanı değiştirin.");
            }
            
            // Başkan rolünü atama
            club.setPresident(user);
            clubRepository.save(club);
        }
        
        // Mevcut üyelik kontrolü
        Optional<ClubMembership> existingMembership = clubMembershipRepository.findByClubIdAndUserId(clubId, userId);
        
        if (existingMembership.isPresent()) {
            ClubMembership membership = existingMembership.get();
            
            // Eğer üyelik aktif değilse aktifleştir
            if (!membership.isActive()) {
                membership.setActive(true);
                membership.setLeaveDate(null);
                membership.setJoinDate(LocalDateTime.now());
            }
            
            // Rolü güncelle
            membership.setRole(membershipRole);
            clubMembershipRepository.save(membership);
        } else {
            // Yeni üyelik oluştur
            ClubMembership membership = ClubMembership.builder()
                    .club(club)
                    .user(user)
                    .role(membershipRole)
                    .joinDate(LocalDateTime.now())
                    .active(true)
                    .build();
            clubMembershipRepository.save(membership);
        }
        
        // Kullanıcıya uygun rol atanır
        if (role == User.Role.CLUB_PRESIDENT && user.getRole() != User.Role.ADMIN) {
            user.setRole(User.Role.CLUB_PRESIDENT);
            userRepository.save(user);
        }
        
        return userMapper.toDto(user);
    }
    
    @Override
    @Transactional
    public UserDto changeClubMemberRole(Long clubId, Long userId, User.Role newRole) {
        // Kulüp kontrolü
        Club club = clubRepository.findById(clubId)
                .orElseThrow(() -> new EntityNotFoundException("Kulüp bulunamadı: " + clubId));
        
        // Kullanıcı kontrolü
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("Kullanıcı bulunamadı: " + userId));
        
        // Rol kontrolü - sadece kulüp rollerini kabul et
        validateClubRole(newRole);
        
        // Üyelik kontrolü
        ClubMembership membership = clubMembershipRepository.findByClubIdAndUserId(clubId, userId)
                .orElseThrow(() -> new EntityNotFoundException("Kulüp üyeliği bulunamadı"));
        
        // Başkan değişikliği
        if (newRole == User.Role.CLUB_PRESIDENT) {
            // Başkan değişikliği için özel metodu çağır
            changeClubPresident(clubId, userId);
        } else {
            // User.Role'dan ClubMembership.Role'a dönüştür
            ClubMembership.Role membershipRole = mapUserRoleToClubRole(newRole);
            
            // Eğer mevcut üye başkansa ve rolü değişiyorsa, başkanlığı kaldır
            if (membership.getRole() == ClubMembership.Role.PRESIDENT && club.getPresident().getId().equals(userId)) {
                club.setPresident(null);
                clubRepository.save(club);
                
                // Kullanıcı rolünü güncelle (başka bir kulüpte başkan değilse)
                if (clubMembershipRepository.findByUserIdAndActive(userId, true).stream()
                        .filter(m -> !m.getClub().getId().equals(clubId))
                        .noneMatch(m -> m.getRole() == ClubMembership.Role.PRESIDENT)) {
                    user.setRole(User.Role.STUDENT);
                    userRepository.save(user);
                }
            }
            
            // Rolü güncelle
            membership.setRole(membershipRole);
            clubMembershipRepository.save(membership);
        }
        
        return userMapper.toDto(user);
    }
    
    @Override
    @Transactional
    public void removeClubMember(Long clubId, Long userId) {
        // Kulüp kontrolü
        Club club = clubRepository.findById(clubId)
                .orElseThrow(() -> new EntityNotFoundException("Kulüp bulunamadı: " + clubId));
        
        // Üyelik kontrolü
        ClubMembership membership = clubMembershipRepository.findByClubIdAndUserId(clubId, userId)
                .orElseThrow(() -> new EntityNotFoundException("Kulüp üyeliği bulunamadı"));
        
        // Başkan kontrolü
        if (membership.getRole() == ClubMembership.Role.PRESIDENT && 
            club.getPresident() != null && 
            club.getPresident().getId().equals(userId)) {
            throw new IllegalStateException("Kulüp başkanı üyelikten çıkarılamaz. Önce başkanı değiştirin.");
        }
        
        // Üyeliği pasif yap
        membership.setActive(false);
        membership.setLeaveDate(LocalDateTime.now());
        clubMembershipRepository.save(membership);
        
        // Kullanıcı bilgilerini güncelle
        User user = membership.getUser();
        if (user.getRole() == User.Role.CLUB_PRESIDENT) {
            // Eğer kullanıcının başka aktif kulüp üyeliği yoksa STUDENT rolüne geri çevir
            if (clubMembershipRepository.findByUserIdAndActive(userId, true).isEmpty()) {
                user.setRole(User.Role.STUDENT);
                userRepository.save(user);
            }
        }
    }
    
    @Override
    @Transactional
    public ClubDto setClubStatus(Long clubId, boolean active) {
        // Kulüp kontrolü
        Club club = clubRepository.findById(clubId)
                .orElseThrow(() -> new EntityNotFoundException("Kulüp bulunamadı: " + clubId));
        
        // Durumu güncelle
        club.setStatus(active ? Club.ClubStatus.ACTIVE : Club.ClubStatus.INACTIVE);
        club = clubRepository.save(club);
        
        return clubMapper.toDto(club);
    }
} 