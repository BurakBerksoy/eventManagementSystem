package com.example.cmManagementSystem.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "club_memberships")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ClubMembership {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "club_id", nullable = false)
    private Club club;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;
    
    @Column(name = "join_date")
    private LocalDateTime joinDate;
    
    @Column(name = "leave_date")
    private LocalDateTime leaveDate;
    
    @Column(nullable = false)
    private boolean active = true;
    
    @Column(length = 1000)
    private String notes;
    
    @Column(name = "created_by")
    private Long createdBy;
    
    @Column(name = "updated_by")
    private Long updatedBy;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    /**
     * Üyeliğin aktif olup olmadığını döndürür
     * 
     * @return Üyelik aktif mi
     */
    public boolean isActive() {
        return this.active;
    }
    
    /**
     * Üyeliğin aktif olup olmadığını döndürür (lombok tarafından oluşturulan metod)
     * 
     * @return Üyelik aktif mi
     */
    public boolean getIsActive() {
        return this.active;
    }
    
    // Üyelik oluşturma tarihini otomatik olarak ayarla
    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        if (this.joinDate == null) {
            this.joinDate = LocalDateTime.now();
        }
    }
    
    // Üyelik güncelleme tarihini otomatik olarak ayarla
    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
    
    /**
     * Üyeliğin son güncelleme tarihini ayarlar
     *
     * @param lastUpdated Son güncelleme tarihi
     */
    public void setLastUpdated(LocalDateTime lastUpdated) {
        this.updatedAt = lastUpdated;
    }
    
    // Kulüp üye rolleri
    public enum Role {
        PRESIDENT,       // Kulüp Başkanı
        ACCOUNTANT,      // Muhasebeci
        VICE_PRESIDENT,  // Başkan Yardımcısı
        SECRETARY,       // Sekreter
        MEMBER,          // Normal Üye
        COORDINATOR,     // Koordinatör
        ADVISOR          // Danışman
    }
} 