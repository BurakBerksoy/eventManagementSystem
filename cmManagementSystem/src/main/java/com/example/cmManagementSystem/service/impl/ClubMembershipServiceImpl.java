package com.example.cmManagementSystem.service.impl;

import com.example.cmManagementSystem.dto.ClubMembershipDto;
import com.example.cmManagementSystem.dto.ClubMembershipRequestDto;
import com.example.cmManagementSystem.entity.Club;
import com.example.cmManagementSystem.entity.ClubMembership;
import com.example.cmManagementSystem.entity.ClubMembershipRequest;
import com.example.cmManagementSystem.entity.User;
import com.example.cmManagementSystem.repository.ClubMembershipRepository;
import com.example.cmManagementSystem.repository.ClubMembershipRequestRepository;
import com.example.cmManagementSystem.repository.ClubRepository;
import com.example.cmManagementSystem.repository.UserRepository;
import com.example.cmManagementSystem.service.ClubAuthService;
import com.example.cmManagementSystem.service.ClubMembershipService;
import com.example.cmManagementSystem.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ClubMembershipServiceImpl implements ClubMembershipService {
    
    private final ClubMembershipRepository membershipRepository;
    private final ClubMembershipRequestRepository requestRepository;
    private final ClubRepository clubRepository;
    private final UserRepository userRepository;
    private final ClubAuthService clubAuthService;
    private final NotificationService notificationService;
    
    @Override
    @Transactional
    public ClubMembershipDto createMembershipRequest(Long clubId, Long userId, String message) {
        // Kulübü ve kullanıcıyı bul
        Club club = clubRepository.findById(clubId)
                .orElseThrow(() -> new RuntimeException("Kulüp bulunamadı: ID=" + clubId));
        
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Kullanıcı bulunamadı: ID=" + userId));
        
        // Kullanıcı zaten kulüp üyesi mi kontrol et
        if (clubAuthService.isMemberOfClub(userId, clubId)) {
            throw new RuntimeException("Zaten bu kulübün üyesisiniz");
        }
        
        // Kullanıcının bekleyen bir isteği var mı kontrol et
        requestRepository.findByClubIdAndUserIdAndStatus(clubId, userId, ClubMembershipRequest.Status.PENDING)
                .ifPresent(request -> {
                    throw new RuntimeException("Zaten bekleyen bir üyelik isteğiniz var");
                });
        
        // Yeni istek oluştur
        ClubMembershipRequest request = ClubMembershipRequest.builder()
                .club(club)
                .user(user)
                .message(message)
                .status(ClubMembershipRequest.Status.PENDING)
                .requestDate(LocalDateTime.now())
                .build();
        
        ClubMembershipRequest savedRequest = requestRepository.save(request);
        
        // Kulüp başkanına bildirim gönder
        notificationService.createNotification(
                "Yeni Kulüp Üyelik İsteği",
                user.getName() + " kulübünüze katılmak istiyor",
                "CLUB_MEMBERSHIP_REQUEST",
                clubId,
                club.getPresidentId(),
                "{\"requestId\":" + savedRequest.getId() + ",\"clubId\":" + clubId + "}"
        );
        
        // Yanıtı hazırla
        return ClubMembershipDto.builder()
                .id(null) // Henüz üyelik oluşmadı
                .clubId(club.getId())
                .clubName(club.getName())
                .clubLogo(club.getLogo())
                .userId(user.getId())
                .userName(user.getName())
                .role(null) // Henüz rol yok
                .active(false) // Henüz aktif değil
                .build();
    }
    
    @Override
    @Transactional
    public ClubMembershipDto approveMembershipRequest(Long requestId, Long processorId) {
        // İsteği bul
        ClubMembershipRequest request = requestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Üyelik isteği bulunamadı: ID=" + requestId));
        
        // İsteğin durumunu kontrol et
        if (request.getStatus() != ClubMembershipRequest.Status.PENDING) {
            throw new RuntimeException("Bu istek zaten işlenmiş");
        }
        
        // İşlemi yapan kullanıcıyı bul
        User processor = userRepository.findById(processorId)
                .orElseThrow(() -> new RuntimeException("Kullanıcı bulunamadı: ID=" + processorId));
        
        // Kullanıcının yetkisini kontrol et (başkan veya yönetici olmalı)
        Club club = request.getClub();
        if (!clubAuthService.hasRoleInClub(processorId, club.getId(), "PRESIDENT") && 
            !clubAuthService.hasRoleInClub(processorId, club.getId(), "MANAGER")) {
            throw new RuntimeException("Bu işlem için yetkiniz yok");
        }
        
        // İsteği onayla
        request.setStatus(ClubMembershipRequest.Status.APPROVED);
        request.setProcessDate(LocalDateTime.now());
        request.setProcessedBy(processor);
        requestRepository.save(request);
        
        // Kulüp üyeliği oluştur
        User user = request.getUser();
        ClubMembership membership = ClubMembership.builder()
                .club(club)
                .user(user)
                .role(ClubMembership.Role.MEMBER)
                .joinDate(LocalDateTime.now())
                .active(true)
                .build();
        
        ClubMembership savedMembership = membershipRepository.save(membership);
        
        // Kullanıcıya bildirim gönder
        notificationService.createNotification(
                "Kulüp Üyelik İsteğiniz Onaylandı",
                club.getName() + " kulübüne katılım isteğiniz onaylanmıştır.",
                "CLUB",
                club.getId(),
                user.getId(),
                null
        );
        
        // Yanıtı hazırla
        return ClubMembershipDto.builder()
                .id(savedMembership.getId())
                .clubId(club.getId())
                .clubName(club.getName())
                .clubLogo(club.getLogo())
                .userId(user.getId())
                .userName(user.getName())
                .role(savedMembership.getRole().toString())
                .joinDate(savedMembership.getJoinDate())
                .active(savedMembership.isActive())
                .build();
    }
    
    @Override
    @Transactional
    public void rejectMembershipRequest(Long requestId, Long processorId) {
        // İsteği bul
        ClubMembershipRequest request = requestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Üyelik isteği bulunamadı: ID=" + requestId));
        
        // İsteğin durumunu kontrol et
        if (request.getStatus() != ClubMembershipRequest.Status.PENDING) {
            throw new RuntimeException("Bu istek zaten işlenmiş");
        }
        
        // İşlemi yapan kullanıcıyı bul
        User processor = userRepository.findById(processorId)
                .orElseThrow(() -> new RuntimeException("Kullanıcı bulunamadı: ID=" + processorId));
        
        // Kullanıcının yetkisini kontrol et (başkan veya yönetici olmalı)
        Club club = request.getClub();
        if (!clubAuthService.hasRoleInClub(processorId, club.getId(), "PRESIDENT") && 
            !clubAuthService.hasRoleInClub(processorId, club.getId(), "MANAGER")) {
            throw new RuntimeException("Bu işlem için yetkiniz yok");
        }
        
        // İsteği reddet
        request.setStatus(ClubMembershipRequest.Status.REJECTED);
        request.setProcessDate(LocalDateTime.now());
        request.setProcessedBy(processor);
        requestRepository.save(request);
        
        // Kullanıcıya bildirim gönder
        User user = request.getUser();
        notificationService.createNotification(
                "Kulüp Üyelik İsteğiniz Reddedildi",
                club.getName() + " kulübüne katılım isteğiniz reddedilmiştir.",
                "CLUB",
                club.getId(),
                user.getId(),
                null
        );
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<ClubMembershipRequestDto> getPendingMembershipRequests(Long clubId, Long userId) {
        // Kulübü bul
        Club club = clubRepository.findById(clubId)
                .orElseThrow(() -> new RuntimeException("Kulüp bulunamadı: ID=" + clubId));
        
        // Kullanıcının yetkisini kontrol et (başkan veya yönetici olmalı)
        if (!clubAuthService.hasRoleInClub(userId, clubId, "PRESIDENT") && 
            !clubAuthService.hasRoleInClub(userId, clubId, "MANAGER")) {
            throw new RuntimeException("Bu istekleri görüntülemek için yetkiniz yok");
        }
        
        // Bekleyen istekleri getir
        List<ClubMembershipRequest> requests = requestRepository.findPendingRequestsByClubId(clubId);
        
        // DTO'ya dönüştür
        List<ClubMembershipRequestDto> requestDtos = requests.stream()
                .map(request -> ClubMembershipRequestDto.builder()
                        .id(request.getId())
                        .clubId(club.getId())
                        .clubName(club.getName())
                        .clubLogo(club.getLogo())
                        .userId(request.getUser().getId())
                        .userName(request.getUser().getName())
                        .userProfileImage(request.getUser().getProfileImage())
                        .status(request.getStatus().toString())
                        .message(request.getMessage())
                        .requestDate(request.getRequestDate())
                        .build())
                .collect(Collectors.toList());

        return requestDtos;
    }
    
    @Override
    @Transactional
    public void leaveClub(Long clubId, Long userId) {
        // Kulübü bul
        Club club = clubRepository.findById(clubId)
                .orElseThrow(() -> new RuntimeException("Kulüp bulunamadı: ID=" + clubId));
        
        // Kullanıcıyı bul
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Kullanıcı bulunamadı: ID=" + userId));
        
        // Kullanıcı kulüp üyesi mi kontrol et
        if (!clubAuthService.isMemberOfClub(userId, clubId)) {
            throw new RuntimeException("Bu kulübün üyesi değilsiniz");
        }
        
        // Kullanıcı kulüp başkanı mı kontrol et
        if (clubAuthService.hasRoleInClub(userId, clubId, "PRESIDENT")) {
            throw new RuntimeException("Kulüp başkanı kulüpten ayrılamaz");
        }
        
        // Üyeliği bul
        ClubMembership membership = membershipRepository.findByClubIdAndUserId(clubId, userId)
                .orElseThrow(() -> new RuntimeException("Üyelik bulunamadı"));
        
        // Üyeliği pasif yap
        membership.setActive(false);
        membership.setLeaveDate(LocalDateTime.now());
        membershipRepository.save(membership);
    }
    
    @Override
    @Transactional
    public ClubMembershipDto changeMemberRole(Long clubId, Long memberId, String newRole, Long changerId) {
        // Kulübü bul
        Club club = clubRepository.findById(clubId)
                .orElseThrow(() -> new RuntimeException("Kulüp bulunamadı: ID=" + clubId));
        
        // Değiştirilecek üyeyi bul
        User member = userRepository.findById(memberId)
                .orElseThrow(() -> new RuntimeException("Kullanıcı bulunamadı: ID=" + memberId));
        
        // Değişikliği yapan kullanıcıyı bul
        User changer = userRepository.findById(changerId)
                .orElseThrow(() -> new RuntimeException("Kullanıcı bulunamadı: ID=" + changerId));
        
        // Değişikliği yapan kullanıcının yetkisini kontrol et (başkan olmalı)
        if (!clubAuthService.hasRoleInClub(changerId, clubId, "PRESIDENT")) {
            throw new RuntimeException("Bu işlem için yetkiniz yok");
        }
        
        // Üyeliği bul
        ClubMembership membership = membershipRepository.findByClubIdAndUserId(clubId, memberId)
                .orElseThrow(() -> new RuntimeException("Üyelik bulunamadı"));
        
        // Yeni rolü ayarla
        try {
            ClubMembership.Role role = ClubMembership.Role.valueOf(newRole.toUpperCase());
            membership.setRole(role);
            membership.setLastUpdated(LocalDateTime.now());
            ClubMembership savedMembership = membershipRepository.save(membership);
            
            // Kullanıcıya bildirim gönder
            notificationService.createNotification(
                    "Kulüp Rolünüz Güncellendi",
                    club.getName() + " kulübündeki rolünüz " + role.toString() + " olarak güncellenmiştir.",
                    "CLUB",
                    club.getId(),
                    memberId,
                    null
            );
            
            // Yanıtı hazırla
            return ClubMembershipDto.builder()
                    .id(savedMembership.getId())
                    .clubId(club.getId())
                    .clubName(club.getName())
                    .clubLogo(club.getLogo())
                    .userId(member.getId())
                    .userName(member.getName())
                    .role(savedMembership.getRole().toString())
                    .joinDate(savedMembership.getJoinDate())
                    .active(savedMembership.isActive())
                    .build();
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Geçersiz rol: " + newRole);
        }
    }
    
    @Override
    @Transactional(readOnly = true)
    public ClubMembershipDto getMembershipInfo(Long clubId, Long userId) {
        // Kullanıcı kulüp üyesi mi kontrol et
        if (!clubAuthService.isMemberOfClub(userId, clubId)) {
            // Bekleyen bir isteği var mı kontrol et
            ClubMembershipRequest pendingRequest = requestRepository
                    .findByClubIdAndUserIdAndStatus(clubId, userId, ClubMembershipRequest.Status.PENDING)
                    .orElse(null);
            
            // Bekleyen istek varsa, isPending=true döndür
            if (pendingRequest != null) {
                return ClubMembershipDto.builder()
                        .clubId(clubId)
                        .userId(userId)
                        .isMember(false)
                        .isPending(true)
                        .build();
            }
            
            // Üye değil ve bekleyen istek yok
            return ClubMembershipDto.builder()
                    .clubId(clubId)
                    .userId(userId)
                    .isMember(false)
                    .isPending(false)
                    .build();
        }
        
        // Üyeliği bul
        return membershipRepository.findByClubIdAndUserId(clubId, userId)
                .map(membership -> {
                    Club club = membership.getClub();
                    User user = membership.getUser();
                    
                    return ClubMembershipDto.builder()
                            .id(membership.getId())
                            .clubId(club.getId())
                            .clubName(club.getName())
                            .clubLogo(club.getLogo())
                            .userId(user.getId())
                            .userName(user.getName())
                            .role(membership.getRole().toString())
                            .joinDate(membership.getJoinDate())
                            .leaveDate(membership.getLeaveDate())
                            .active(membership.isActive())
                            .responsibilities(membership.getNotes())
                            .isMember(true)
                            .isPending(false)
                            .build();
                })
                .orElseThrow(() -> new RuntimeException("Üyelik bulunamadı"));
    }
} 