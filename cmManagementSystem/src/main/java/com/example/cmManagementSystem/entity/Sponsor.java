package com.example.cmManagementSystem.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "sponsors")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Sponsor {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String name;
    
    @Column(length = 1000)
    private String description;
    
    @Column(name = "logo_url")
    private String logoUrl;
    
    @Column(name = "website_url")
    private String websiteUrl;
    
    @Column(name = "contact_person")
    private String contactPerson;
    
    @Column(name = "contact_email")
    private String contactEmail;
    
    @Column(name = "contact_phone")
    private String contactPhone;
    
    @Column(name = "address", length = 1000)
    private String address;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SponsorType type;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SponsorLevel level;
    
    @Column(name = "start_date")
    private LocalDateTime startDate;
    
    @Column(name = "end_date")
    private LocalDateTime endDate;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by")
    private User createdBy;
    
    @ManyToMany(mappedBy = "sponsors")
    private Set<Club> clubs = new HashSet<>();
    
    @ManyToMany(mappedBy = "sponsors")
    private Set<Event> events = new HashSet<>();
    
    // Sponsor oluşturma tarihini otomatik olarak ayarla
    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        if (this.type == null) {
            this.type = SponsorType.FINANCIAL;
        }
        if (this.level == null) {
            this.level = SponsorLevel.STANDARD;
        }
    }
    
    // Sponsor güncelleme tarihini otomatik olarak ayarla
    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
    
    // Sponsor tipi enum
    public enum SponsorType {
        FINANCIAL,     // Mali sponsor
        IN_KIND,       // Ayni sponsor
        SERVICE,       // Hizmet sponsoru
        MEDIA          // Medya sponsoru
    }
    
    // Sponsor seviyesi enum
    public enum SponsorLevel {
        PLATINUM,     // Platin sponsor
        GOLD,         // Altın sponsor
        SILVER,       // Gümüş sponsor
        BRONZE,       // Bronz sponsor
        STANDARD      // Standart sponsor
    }
} 