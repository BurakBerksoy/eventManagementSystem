package com.example.cmManagementSystem.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "waiting_lists")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WaitingList {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "event_id", nullable = false)
    private Event event;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @Column(name = "join_date", nullable = false)
    private LocalDateTime joinDate;
    
    @Column(name = "position")
    private Integer position;
    
    @Column(name = "notification_sent")
    private Boolean notificationSent = false;
    
    @Column(name = "notification_date")
    private LocalDateTime notificationDate;
    
    @Column(name = "status")
    @Enumerated(EnumType.STRING)
    private WaitingStatus status;
    
    @Column(name = "response_deadline")
    private LocalDateTime responseDeadline;
    
    @Column(name = "response_date")
    private LocalDateTime responseDate;
    
    @Column(name = "notes", length = 1000)
    private String notes;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    // İlk oluşturma zamanını ayarla
    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        this.joinDate = LocalDateTime.now();
        if (this.status == null) {
            this.status = WaitingStatus.WAITING;
        }
    }
    
    // Güncelleme zamanını ayarla
    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
    
    // Bekleme listesi durumu
    public enum WaitingStatus {
        WAITING,         // Beklemede
        NOTIFIED,        // Bildirim gönderildi
        ACCEPTED,        // Kabul edildi (Katılımcı onaylandı)
        DECLINED,        // Reddedildi (Kullanıcı teklifi reddetti)
        EXPIRED,         // Süresi doldu (Yanıt vermedi)
        CANCELLED        // İptal edildi (Etkinlik veya kullanıcı tarafından)
    }
} 