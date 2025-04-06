package com.example.cmManagementSystem.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "event_participations")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EventParticipation {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "event_id", nullable = false)
    private Event event;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ParticipationStatus status;
    
    @Column(name = "registration_date")
    private LocalDateTime registrationDate;
    
    @Column(name = "attendance_date")
    private LocalDateTime attendanceDate;
    
    @Column(name = "cancellation_date")
    private LocalDateTime cancellationDate;
    
    @Column(name = "cancellation_reason")
    private String cancellationReason;
    
    @Column(name = "feedback_text", length = 1000)
    private String feedbackText;
    
    @Column(name = "feedback_rating")
    private Integer feedbackRating;
    
    @Column(name = "feedback_date")
    private LocalDateTime feedbackDate;
    
    @Column(name = "certificate_code")
    private String certificateCode;
    
    @Column(name = "certificate_issue_date")
    private LocalDateTime certificateIssueDate;
    
    @Column(name = "special_needs")
    private String specialNeeds;
    
    @Column(name = "dietary_restrictions")
    private String dietaryRestrictions;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    // Katılım oluşturma tarihini otomatik olarak ayarla
    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        if (this.registrationDate == null) {
            this.registrationDate = LocalDateTime.now();
        }
        if (this.status == null) {
            this.status = ParticipationStatus.REGISTERED;
        }
    }
    
    // Katılım güncelleme tarihini otomatik olarak ayarla
    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
    
    // Katılım durumu
    public enum ParticipationStatus {
        REGISTERED,   // Kayıtlı
        ATTENDED,     // Katıldı
        ABSENT,       // Katılmadı
        CANCELLED,    // İptal edildi
        WAITLISTED    // Bekleme listesinde
    }
} 