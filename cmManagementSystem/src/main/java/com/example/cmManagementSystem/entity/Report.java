package com.example.cmManagementSystem.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "reports")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Report {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String title;
    
    @Column(length = 2000)
    private String description;
    
    @Column(name = "report_data", columnDefinition = "TEXT")
    private String reportData;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ReportType type;
    
    @Column(name = "report_parameters", length = 1000)
    private String reportParameters;
    
    @Column(name = "start_date")
    private LocalDateTime startDate;
    
    @Column(name = "end_date")
    private LocalDateTime endDate;
    
    @Column(name = "file_url")
    private String fileUrl;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "club_id")
    private Club club;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "event_id")
    private Event event;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by", nullable = false)
    private User createdBy;
    
    @Column(name = "is_public")
    private Boolean isPublic = false;
    
    @Column(name = "is_scheduled")
    private Boolean isScheduled = false;
    
    @Column(name = "schedule_interval")
    private String scheduleInterval;
    
    @Column(name = "last_run_date")
    private LocalDateTime lastRunDate;
    
    @Column(name = "next_run_date")
    private LocalDateTime nextRunDate;
    
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
            this.type = ReportType.CUSTOM;
        }
    }
    
    // Güncelleme zamanını ayarla
    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
    
    // Rapor tipi
    public enum ReportType {
        EVENT_PARTICIPATION,    // Etkinlik katılım raporu
        CLUB_MEMBERSHIP,        // Kulüp üyelik raporu
        CLUB_ACTIVITY,          // Kulüp aktivite raporu
        FINANCIAL,              // Finansal rapor
        FEEDBACK,               // Geri bildirim raporu
        PERFORMANCE,            // Performans raporu
        ATTENDANCE,             // Katılım raporu
        SURVEY,                 // Anket raporu
        CUSTOM                  // Özel rapor
    }
} 