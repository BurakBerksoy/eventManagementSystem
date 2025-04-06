package com.example.cmManagementSystem.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.time.LocalTime;

@Entity
@Table(name = "notification_preferences")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationPreference {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @Column(name = "email_enabled")
    private Boolean emailEnabled = true;
    
    @Column(name = "system_enabled")
    private Boolean systemEnabled = true;
    
    @Column(name = "sms_enabled")
    private Boolean smsEnabled = false;
    
    @Column(name = "email_frequency")
    @Enumerated(EnumType.STRING)
    private NotificationFrequency emailFrequency = NotificationFrequency.IMMEDIATE;
    
    @Column(name = "system_frequency")
    @Enumerated(EnumType.STRING)
    private NotificationFrequency systemFrequency = NotificationFrequency.IMMEDIATE;
    
    @Column(name = "sms_frequency")
    @Enumerated(EnumType.STRING)
    private NotificationFrequency smsFrequency = NotificationFrequency.IMMEDIATE;
    
    @Column(name = "event_reminder_days")
    private Integer eventReminderDays = 1;
    
    @Column(name = "quiet_hours_start")
    private LocalTime quietHoursStart = LocalTime.of(22, 0);
    
    @Column(name = "quiet_hours_end")
    private LocalTime quietHoursEnd = LocalTime.of(8, 0);
    
    @Column(name = "quiet_hours_enabled")
    private Boolean quietHoursEnabled = false;
    
    @Column(name = "event_reminders_enabled")
    private Boolean eventRemindersEnabled = true;
    
    @Column(name = "club_announcements_enabled")
    private Boolean clubAnnouncementsEnabled = true;
    
    @Column(name = "membership_updates_enabled")
    private Boolean membershipUpdatesEnabled = true;
    
    @Column(name = "certificate_notifications_enabled")
    private Boolean certificateNotificationsEnabled = true;
    
    @Column(name = "system_announcements_enabled")
    private Boolean systemAnnouncementsEnabled = true;
    
    @Column(name = "marketing_emails_enabled")
    private Boolean marketingEmailsEnabled = false;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
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
    
    // Bildirim sıklığı
    public enum NotificationFrequency {
        IMMEDIATE,    // Anında
        HOURLY,       // Saatlik
        DAILY,        // Günlük
        WEEKLY        // Haftalık
    }
} 