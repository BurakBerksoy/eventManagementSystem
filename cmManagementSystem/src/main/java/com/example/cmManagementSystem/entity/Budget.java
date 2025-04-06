package com.example.cmManagementSystem.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "budgets")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Budget {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "club_id", nullable = false)
    private Club club;
    
    @Column(name = "total_amount", nullable = false)
    private BigDecimal totalAmount;
    
    @Column(name = "available_amount", nullable = false)
    private BigDecimal availableAmount;
    
    @Column(name = "allocated_amount", nullable = false)
    private BigDecimal allocatedAmount;
    
    @Column(name = "academic_year", nullable = false)
    private String academicYear;
    
    @Column(name = "start_date", nullable = false)
    private LocalDateTime startDate;
    
    @Column(name = "end_date", nullable = false)
    private LocalDateTime endDate;
    
    @Column(name = "description", length = 1000)
    private String description;
    
    @Column(name = "status", nullable = false)
    @Enumerated(EnumType.STRING)
    private BudgetStatus status;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by")
    private User createdBy;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    // Bütçe oluşturma tarihini otomatik olarak ayarla
    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        if (this.status == null) {
            this.status = BudgetStatus.ACTIVE;
        }
    }
    
    // Bütçe güncelleme tarihini otomatik olarak ayarla
    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
    
    // Bütçe durumu enum
    public enum BudgetStatus {
        ACTIVE,     // Aktif
        INACTIVE,   // Pasif
        PENDING,    // Onay bekliyor
        APPROVED,   // Onaylandı
        REJECTED    // Reddedildi
    }
} 