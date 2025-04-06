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
@Table(name = "venues")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Venue {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String name;
    
    @Column(length = 1000)
    private String description;
    
    @Column(nullable = false)
    private String address;
    
    @Column
    private String city;
    
    @Column
    private String district;
    
    @Column(name = "postal_code")
    private String postalCode;
    
    @Column
    private String country;
    
    @Column
    private String latitude;
    
    @Column
    private String longitude;
    
    @Column
    private Integer capacity;
    
    @Column(name = "contact_person")
    private String contactPerson;
    
    @Column(name = "contact_email")
    private String contactEmail;
    
    @Column(name = "contact_phone")
    private String contactPhone;
    
    @Column(name = "rental_fee")
    private BigDecimal rentalFee;
    
    @Column(name = "is_university_venue")
    private Boolean isUniversityVenue = false;
    
    @Column(name = "equipment_info", length = 1000)
    private String equipmentInfo;
    
    @Column(name = "accessibility_info", length = 1000)
    private String accessibilityInfo;
    
    @Column(name = "image_url")
    private String imageUrl;
    
    @Column(name = "available_times", length = 1000)
    private String availableTimes;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by")
    private User createdBy;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @OneToMany(mappedBy = "venue")
    private Set<VenueReservation> reservations = new HashSet<>();
    
    // İlk oluşturma zamanını ayarla
    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }
    
    // Güncelleme zamanını ayarla
    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
} 