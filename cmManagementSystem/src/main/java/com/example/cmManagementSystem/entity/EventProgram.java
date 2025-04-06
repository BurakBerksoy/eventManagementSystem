package com.example.cmManagementSystem.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "event_programs")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EventProgram {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "event_id", nullable = false)
    private Event event;
    
    @Column(nullable = false)
    private String title;
    
    @Column(length = 1000)
    private String description;
    
    @Column(name = "start_time", nullable = false)
    private LocalDateTime startTime;
    
    @Column(name = "end_time", nullable = false)
    private LocalDateTime endTime;
    
    @Column
    private String location;
    
    @Column
    private Integer orderIndex;
    
    @Column(name = "speaker_name")
    private String speakerName;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "speaker_id")
    private EventSpeaker speaker;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ProgramType type;
    
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
            this.type = ProgramType.SESSION;
        }
    }
    
    // Güncelleme zamanını ayarla
    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
    
    // Program öğesi tipi
    public enum ProgramType {
        OPENING,        // Açılış
        CLOSING,        // Kapanış
        SESSION,        // Oturum
        BREAK,          // Ara
        WORKSHOP,       // Atölye çalışması
        PANEL,          // Panel
        NETWORKING,     // Networking etkinliği
        MEAL            // Yemek
    }
} 