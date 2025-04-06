package com.example.cmManagementSystem.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "announcements")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Announcement {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String title;
    
    @Column(length = 2000)
    private String content;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "club_id")
    private Club club;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by", nullable = false)
    private User createdBy;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AnnouncementType type;
    
    @Column(name = "publish_date")
    private LocalDateTime publishDate;
    
    @Column(name = "expiry_date")
    private LocalDateTime expiryDate;
    
    @Column(nullable = false)
    private boolean active = true;
    
    @Column(name = "image_url")
    private String imageUrl;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    // Duyuru oluşturma tarihini otomatik olarak ayarla
    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        if (this.publishDate == null) {
            this.publishDate = LocalDateTime.now();
        }
        if (this.type == null) {
            this.type = AnnouncementType.GENERAL;
        }
    }
    
    // Duyuru güncelleme tarihini otomatik olarak ayarla
    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
    
    // Duyuru tipi
    public enum AnnouncementType {
        GENERAL,            // Genel duyuru
        IMPORTANT,          // Önemli duyuru
        EVENT,              // Etkinlik duyurusu
        MEMBERS_ONLY        // Sadece üyelere özel duyuru
    }
} 