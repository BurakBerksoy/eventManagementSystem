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
@Table(name = "events")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Event {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String title;
    
    @Column(length = 2000)
    private String description;
    
    @Column(name = "start_date", nullable = false)
    private LocalDateTime startDate;
    
    @Column(name = "end_date", nullable = false)
    private LocalDateTime endDate;
    
    @Column
    private String location;
    
    @Column(name = "location_details")
    private String locationDetails;
    
    @Column
    private Integer capacity;
    
    @Column
    private String image;
    
    @Column
    private String category;
    
    @Column
    private Boolean isFree = true;
    
    @Column
    private Double price;
    
    @Column(name = "registration_deadline")
    private LocalDateTime registrationDeadline;
    
    @Column(name = "has_certificate")
    private Boolean hasCertificate = false;
    
    @Column(name = "has_catering")
    private Boolean hasCatering = false;
    
    @Column(name = "catering_details", length = 1000)
    private String cateringDetails;
    
    @Column(name = "venue_contact")
    private String venueContact;
    
    @Column(name = "venue_notes", length = 1000)
    private String venueNotes;
    
    @Column(name = "allow_waitlist")
    private Boolean allowWaitlist = true;
    
    @Column(name = "waitlist_limit")
    private Integer waitlistLimit;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "club_id")
    private Club club;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by")
    private User createdBy;
    
    @OneToMany(mappedBy = "event", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<EventParticipation> participations = new HashSet<>();
    
    @OneToMany(mappedBy = "event", cascade = CascadeType.ALL)
    private Set<Certificate> certificates = new HashSet<>();
    
    @OneToMany(mappedBy = "event", cascade = CascadeType.ALL)
    private Set<EventSpeaker> speakers = new HashSet<>();
    
    @OneToMany(mappedBy = "event", cascade = CascadeType.ALL)
    private Set<EventProgram> programItems = new HashSet<>();
    
    @OneToMany(mappedBy = "event", cascade = CascadeType.ALL)
    private Set<WaitingList> waitingList = new HashSet<>();
    
    @ManyToMany
    @JoinTable(
        name = "event_sponsors",
        joinColumns = @JoinColumn(name = "event_id"),
        inverseJoinColumns = @JoinColumn(name = "sponsor_id")
    )
    private Set<Sponsor> sponsors = new HashSet<>();
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EventStatus status;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @Column(name = "max_participants")
    private Integer maxParticipants;
    
    @Column(name = "budget")
    private Double budget;
    
    @Column(name = "type")
    @Enumerated(EnumType.STRING)
    private EventType type;
    
    // Etkinlik oluşturma tarihini otomatik olarak ayarla
    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        if (this.status == null) {
            this.status = EventStatus.PENDING;
        }
    }
    
    // Etkinlik güncelleme tarihini otomatik olarak ayarla
    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
    
    // Etkinlik durumu
    public enum EventStatus {
        PENDING,     // Onay bekliyor
        APPROVED,    // Onaylandı
        REJECTED,    // Reddedildi
        CANCELED,    // İptal edildi
        COMPLETED    // Tamamlandı
    }
    
    public Integer getMaxParticipants() {
        return this.maxParticipants;
    }
    
    public void setMaxParticipants(Integer maxParticipants) {
        this.maxParticipants = maxParticipants;
    }
    
    public Double getBudget() {
        return this.budget;
    }
    
    public void setBudget(Double budget) {
        this.budget = budget;
    }
    
    public EventType getType() {
        return this.type;
    }
    
    public void setType(EventType type) {
        this.type = type;
    }
    
    public enum EventType {
        CONFERENCE,    // Konferans
        WORKSHOP,      // Atölye
        SEMINAR,       // Seminer
        SOCIAL,        // Sosyal Etkinlik
        CULTURAL,      // Kültürel Etkinlik
        SPORTS,        // Spor Etkinliği
        ACADEMIC,      // Akademik Etkinlik
        OTHER         // Diğer
    }
} 