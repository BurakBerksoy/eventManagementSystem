package com.example.cmManagementSystem.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "clubs")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Club {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, unique = true)
    private String name;
    
    @Column(length = 1000)
    private String description;
    
    @Column(name = "logo_url")
    private String logoUrl;
    
    @Column(name = "foundation_date")
    private LocalDateTime foundationDate;
    
    @Column
    private String category;
    
    @Column
    private String contactEmail;
    
    @Column
    private String contactPhone;
    
    @Column(name = "social_media")
    private String socialMedia;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ClubStatus status;
    
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "president_id")
    private User president;
    
    @OneToMany(mappedBy = "club", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<ClubMembership> memberships = new HashSet<>();
    
    @OneToMany(mappedBy = "club", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<Event> events = new HashSet<>();
    
    @OneToMany(mappedBy = "club", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<Announcement> announcements = new HashSet<>();
    
    @OneToMany(mappedBy = "club", cascade = CascadeType.ALL)
    private Set<Budget> budgets = new HashSet<>();
    
    @OneToMany(mappedBy = "club", cascade = CascadeType.ALL)
    private Set<Transaction> transactions = new HashSet<>();
    
    @ManyToMany
    @JoinTable(
        name = "club_sponsors",
        joinColumns = @JoinColumn(name = "club_id"),
        inverseJoinColumns = @JoinColumn(name = "sponsor_id")
    )
    private Set<Sponsor> sponsors = new HashSet<>();
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by")
    private User createdBy;
    
    @Column(name = "budget")
    private Double budget;
    
    @Column(name = "founded_at")
    private LocalDateTime foundedAt;
    
    @Column(name = "max_members")
    private Integer maxMembers;
    
    // Kulüp oluşturma tarihini otomatik olarak ayarla
    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        if (this.foundationDate == null) {
            this.foundationDate = LocalDateTime.now();
        }
        if (this.status == null) {
            this.status = ClubStatus.ACTIVE;
        }
    }
    
    // Kulüp güncelleme tarihini otomatik olarak ayarla
    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
    
    // Kulüp durumu
    public enum ClubStatus {
        ACTIVE,      // Aktif
        INACTIVE,    // Pasif
        SUSPENDED,   // Askıya alınmış
        PENDING      // Onay bekliyor
    }
    
    public User getCreatedBy() {
        return this.createdBy;
    }
    
    public void setCreatedBy(User createdBy) {
        this.createdBy = createdBy;
    }
    
    public Double getBudget() {
        return this.budget;
    }
    
    public void setBudget(Double budget) {
        this.budget = budget;
    }
    
    public LocalDateTime getFoundedAt() {
        return this.foundedAt;
    }
    
    public void setFoundedAt(LocalDateTime foundedAt) {
        this.foundedAt = foundedAt;
    }
    
    public Set<ClubMembership> getMembers() {
        return this.memberships;
    }
    
    public void setMembers(Set<ClubMembership> members) {
        this.memberships = members;
    }
    
    public Integer getMaxMembers() {
        return this.maxMembers;
    }
    
    public void setMaxMembers(Integer maxMembers) {
        this.maxMembers = maxMembers;
    }

    /**
     * Kulüp başkanının ID'sini döndürür
     *
     * @return Kulüp başkanının ID'si
     */
    public Long getPresidentId() {
        if (president == null) {
            System.out.println("UYARI: Club ID=" + this.id + " için president null. getPresidentId() null dönüyor.");
            return null;
        }
        
        Long presidentId = president.getId();
        System.out.println("Bilgi: Club ID=" + this.id + " için presidentId=" + presidentId);
        return presidentId;
    }

    /**
     * Kulübün logosunu döndürür
     *
     * @return Kulüp logosu
     */
    public String getLogo() {
        return logoUrl;
    }
} 