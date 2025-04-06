package com.example.cmManagementSystem.service.impl;

import com.example.cmManagementSystem.dto.DigitalAssetDto;
import com.example.cmManagementSystem.entity.Club;
import com.example.cmManagementSystem.entity.DigitalAsset;
import com.example.cmManagementSystem.entity.Event;
import com.example.cmManagementSystem.entity.User;
import com.example.cmManagementSystem.exception.ResourceNotFoundException;
import com.example.cmManagementSystem.repository.ClubRepository;
import com.example.cmManagementSystem.repository.DigitalAssetRepository;
import com.example.cmManagementSystem.repository.EventRepository;
import com.example.cmManagementSystem.repository.UserRepository;
import com.example.cmManagementSystem.service.ClubAuthService;
import com.example.cmManagementSystem.service.DigitalAssetService;
import com.example.cmManagementSystem.service.EventAuthService;
import com.example.cmManagementSystem.service.FileStorageService;
import lombok.extern.slf4j.Slf4j;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Slf4j
@Transactional
public class DigitalAssetServiceImpl implements DigitalAssetService {
    
    private final DigitalAssetRepository digitalAssetRepository;
    private final ClubRepository clubRepository;
    private final EventRepository eventRepository;
    private final UserRepository userRepository;
    private final ModelMapper modelMapper;
    private final FileStorageService fileStorageService;
    private final ClubAuthService clubAuthService;
    private final EventAuthService eventAuthService;
    
    @Autowired
    public DigitalAssetServiceImpl(
            DigitalAssetRepository digitalAssetRepository,
            ClubRepository clubRepository,
            EventRepository eventRepository,
            UserRepository userRepository,
            ModelMapper modelMapper,
            FileStorageService fileStorageService,
            ClubAuthService clubAuthService,
            EventAuthService eventAuthService) {
        this.digitalAssetRepository = digitalAssetRepository;
        this.clubRepository = clubRepository;
        this.eventRepository = eventRepository;
        this.userRepository = userRepository;
        this.modelMapper = modelMapper;
        this.fileStorageService = fileStorageService;
        this.clubAuthService = clubAuthService;
        this.eventAuthService = eventAuthService;
    }
    
    @Override
    public List<DigitalAssetDto> findAll() {
        List<DigitalAsset> digitalAssets = digitalAssetRepository.findAll();
        return digitalAssets.stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }
    
    @Override
    public DigitalAssetDto findById(Long id) {
        DigitalAsset digitalAsset = digitalAssetRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("DigitalAsset", "id", id));
        return mapToDto(digitalAsset);
    }
    
    @Override
    public List<DigitalAssetDto> findByClub(Long clubId) {
        List<DigitalAsset> digitalAssets = digitalAssetRepository.findByClubId(clubId);
        return digitalAssets.stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }
    
    @Override
    public List<DigitalAssetDto> findByEvent(Long eventId) {
        List<DigitalAsset> digitalAssets = digitalAssetRepository.findByEventId(eventId);
        return digitalAssets.stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }
    
    @Override
    public List<DigitalAssetDto> findByType(String type) {
        try {
            DigitalAsset.AssetType assetType = DigitalAsset.AssetType.valueOf(type.toUpperCase());
            List<DigitalAsset> digitalAssets = digitalAssetRepository.findByType(assetType);
            return digitalAssets.stream()
                    .map(this::mapToDto)
                    .collect(Collectors.toList());
        } catch (IllegalArgumentException e) {
            log.error("Geçersiz varlık tipi: {}", type);
            throw new IllegalArgumentException("Geçersiz varlık tipi: " + type);
        }
    }
    
    @Override
    @Transactional
    public DigitalAssetDto uploadAsset(MultipartFile file, DigitalAssetDto assetDto) {
        try {
            // Dosya adını ve URL'ini oluştur
            String fileName = fileStorageService.storeFile(file);
            String fileUrl = fileStorageService.getFileUrl(fileName);
            
            // Kullanıcıyı bul
            User user = userRepository.findById(assetDto.getCreatedById())
                    .orElseThrow(() -> new ResourceNotFoundException("User", "id", assetDto.getCreatedById()));
            
            // Yeni dijital varlık oluştur
            DigitalAsset digitalAsset = new DigitalAsset();
            digitalAsset.setTitle(assetDto.getTitle());
            digitalAsset.setDescription(assetDto.getDescription());
            digitalAsset.setFileUrl(fileUrl);
            digitalAsset.setFileType(file.getContentType());
            digitalAsset.setFileSize(file.getSize());
            digitalAsset.setOriginalFilename(file.getOriginalFilename());
            digitalAsset.setType(assetDto.getType());
            digitalAsset.setCategory(assetDto.getCategory());
            digitalAsset.setIsPublic(assetDto.getIsPublic());
            digitalAsset.setTags(assetDto.getTags());
            digitalAsset.setCreatedBy(user);
            
            // Thumbnail oluşturma (isteğe bağlı)
            if (assetDto.getType() == DigitalAsset.AssetType.IMAGE) {
                // Görsel için thumbnail oluşturma işlemleri
                String thumbnailUrl = fileStorageService.createThumbnail(fileName);
                digitalAsset.setThumbnailUrl(thumbnailUrl);
            }
            
            // Veritabanına kaydet
            DigitalAsset savedAsset = digitalAssetRepository.save(digitalAsset);
            
            // DTO'ya dönüştür ve döndür
            return mapToDto(savedAsset);
        } catch (IOException e) {
            log.error("Dosya yüklenirken hata oluştu", e);
            throw new RuntimeException("Dosya yüklenirken hata oluştu: " + e.getMessage());
        }
    }
    
    @Override
    @Transactional
    public DigitalAssetDto uploadEventAsset(Long eventId, MultipartFile file, DigitalAssetDto assetDto) {
        // Etkinliği bul
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new ResourceNotFoundException("Event", "id", eventId));
        
        // Dosyayı yükle
        DigitalAssetDto uploadedAsset = uploadAsset(file, assetDto);
        
        // Yüklenen varlığı getir ve etkinlikle ilişkilendir
        DigitalAsset digitalAsset = digitalAssetRepository.findById(uploadedAsset.getId())
                .orElseThrow(() -> new ResourceNotFoundException("DigitalAsset", "id", uploadedAsset.getId()));
        
        digitalAsset.setEvent(event);
        digitalAsset = digitalAssetRepository.save(digitalAsset);
        
        return mapToDto(digitalAsset);
    }
    
    @Override
    @Transactional
    public DigitalAssetDto uploadClubAsset(Long clubId, MultipartFile file, DigitalAssetDto assetDto) {
        // Kulübü bul
        Club club = clubRepository.findById(clubId)
                .orElseThrow(() -> new ResourceNotFoundException("Club", "id", clubId));
        
        // Dosyayı yükle
        DigitalAssetDto uploadedAsset = uploadAsset(file, assetDto);
        
        // Yüklenen varlığı getir ve kulüple ilişkilendir
        DigitalAsset digitalAsset = digitalAssetRepository.findById(uploadedAsset.getId())
                .orElseThrow(() -> new ResourceNotFoundException("DigitalAsset", "id", uploadedAsset.getId()));
        
        digitalAsset.setClub(club);
        digitalAsset = digitalAssetRepository.save(digitalAsset);
        
        return mapToDto(digitalAsset);
    }
    
    @Override
    @Transactional
    public DigitalAssetDto updateAsset(Long id, DigitalAssetDto assetDto) {
        // Dijital varlığı bul
        DigitalAsset digitalAsset = digitalAssetRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("DigitalAsset", "id", id));
        
        // Güncellenecek alanları ayarla
        digitalAsset.setTitle(assetDto.getTitle());
        digitalAsset.setDescription(assetDto.getDescription());
        digitalAsset.setType(assetDto.getType());
        digitalAsset.setCategory(assetDto.getCategory());
        digitalAsset.setIsPublic(assetDto.getIsPublic());
        digitalAsset.setTags(assetDto.getTags());
        
        // Veritabanında güncelle
        DigitalAsset updatedAsset = digitalAssetRepository.save(digitalAsset);
        
        return mapToDto(updatedAsset);
    }
    
    @Override
    @Transactional
    public void deleteAsset(Long id) {
        // Dijital varlığı bul
        DigitalAsset digitalAsset = digitalAssetRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("DigitalAsset", "id", id));
        
        // Fiziksel dosyayı sil
        try {
            fileStorageService.deleteFile(digitalAsset.getFileUrl());
            
            // Eğer thumbnail varsa onu da sil
            if (digitalAsset.getThumbnailUrl() != null) {
                fileStorageService.deleteFile(digitalAsset.getThumbnailUrl());
            }
        } catch (IOException e) {
            log.error("Dosya silinirken hata oluştu", e);
            // Hata olsa bile veritabanından silmeye devam et
        }
        
        // Veritabanından sil
        digitalAssetRepository.delete(digitalAsset);
    }
    
    @Override
    public ResponseEntity<byte[]> downloadAsset(Long id) {
        // Dijital varlığı bul
        DigitalAsset digitalAsset = digitalAssetRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("DigitalAsset", "id", id));
        
        try {
            // Dosyayı oku
            byte[] fileContent = fileStorageService.readFile(digitalAsset.getFileUrl());
            
            // HTTP başlıklarını ayarla
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.parseMediaType(digitalAsset.getFileType()));
            headers.setContentDispositionFormData("attachment", digitalAsset.getOriginalFilename());
            
            return ResponseEntity.ok()
                    .headers(headers)
                    .body(fileContent);
        } catch (IOException e) {
            log.error("Dosya okunurken hata oluştu", e);
            throw new RuntimeException("Dosya okunurken hata oluştu: " + e.getMessage());
        }
    }
    
    @Override
    public boolean isAssetOwnedByUser(Long userId, Long assetId) {
        DigitalAsset digitalAsset = digitalAssetRepository.findById(assetId)
                .orElseThrow(() -> new ResourceNotFoundException("DigitalAsset", "id", assetId));
        
        // Asset sahibi kontrolü
        if (digitalAsset.getCreatedBy() != null && digitalAsset.getCreatedBy().getId().equals(userId)) {
            return true;
        }
        
        // Kulüp başkanı kontrolü
        if (digitalAsset.getClub() != null) {
            // Kullanıcı bu kulübün başkanı mı kontrol et
            return clubAuthService.isPresidentOfClub(userId, digitalAsset.getClub().getId());
        }
        
        // Etkinlik oluşturanı kontrolü
        if (digitalAsset.getEvent() != null) {
            // Kullanıcı bu etkinliği oluşturan kulübün başkanı mı kontrol et
            return eventAuthService.isEventCreatedByUser(userId, digitalAsset.getEvent().getId());
        }
        
        return false;
    }
    
    // Entity'den DTO'ya dönüşüm
    private DigitalAssetDto mapToDto(DigitalAsset digitalAsset) {
        DigitalAssetDto dto = modelMapper.map(digitalAsset, DigitalAssetDto.class);
        
        // İlişkili varlıkların ID ve isimlerini ekle
        if (digitalAsset.getClub() != null) {
            dto.setClubId(digitalAsset.getClub().getId());
            dto.setClubName(digitalAsset.getClub().getName());
        }
        
        if (digitalAsset.getEvent() != null) {
            dto.setEventId(digitalAsset.getEvent().getId());
            dto.setEventTitle(digitalAsset.getEvent().getTitle());
        }
        
        if (digitalAsset.getCreatedBy() != null) {
            dto.setCreatedById(digitalAsset.getCreatedBy().getId());
            dto.setCreatedByName(digitalAsset.getCreatedBy().getFullName());
        }
        
        return dto;
    }
} 