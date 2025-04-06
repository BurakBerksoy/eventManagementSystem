package com.example.cmManagementSystem.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "digital_assets")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DigitalAsset {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String title;
    
    @Column(length = 1000)
    private String description;
    
    @Column(name = "file_url", nullable = false)
    private String fileUrl;
    
    @Column(name = "thumbnail_url")
    private String thumbnailUrl;
    
    @Column(name = "file_type", nullable = false)
    private String fileType;
    
    @Column(name = "file_size")
    private Long fileSize;
    
    @Column(name = "original_filename")
    private String originalFilename;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AssetType type;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AssetCategory category;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "club_id")
    private Club club;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "event_id")
    private Event event;
    
    @Column(name = "is_public")
    private Boolean isPublic = false;
    
    @Column(name = "tags", length = 500)
    private String tags;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by", nullable = false)
    private User createdBy;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    // İlk oluşturma zamanını ayarla
    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        if (this.type == null) {
            this.type = AssetType.IMAGE;
        }
        if (this.category == null) {
            this.category = AssetCategory.OTHER;
        }
    }
    
    // Güncelleme zamanını ayarla
    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
    
    // Dijital varlık tipi
    public enum AssetType {
        IMAGE,       // Görsel
        DOCUMENT,    // Doküman
        VIDEO,       // Video
        AUDIO,       // Ses
        DESIGN       // Tasarım dosyası
    }
    
    // Dijital varlık kategorisi
    public enum AssetCategory {
        POSTER,         // Afiş
        FLYER,          // El ilanı
        LOGO,           // Logo
        BANNER,         // Banner
        SOCIAL_MEDIA,   // Sosyal medya görseli
        CERTIFICATE,    // Sertifika şablonu
        PRESENTATION,   // Sunum
        REPORT,         // Rapor
        OTHER           // Diğer
    }
} 