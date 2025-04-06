package com.example.cmManagementSystem.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "transactions")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Transaction {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "club_id", nullable = false)
    private Club club;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "budget_id")
    private Budget budget;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "event_id")
    private Event event;
    
    @Column(name = "amount", nullable = false)
    private BigDecimal amount;
    
    @Column(name = "transaction_date", nullable = false)
    private LocalDateTime transactionDate;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TransactionType type;
    
    @Column(name = "description", length = 1000)
    private String description;
    
    @Column(name = "category")
    private String category;
    
    @Column(name = "receipt_url")
    private String receiptUrl;
    
    @Column(name = "invoice_number")
    private String invoiceNumber;
    
    @Column(name = "vendor_name")
    private String vendorName;
    
    @Column(name = "payment_method")
    private String paymentMethod;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by")
    private User createdBy;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "approved_by")
    private User approvedBy;
    
    @Column(name = "approval_date")
    private LocalDateTime approvalDate;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TransactionStatus status;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    // İşlem oluşturma tarihini otomatik olarak ayarla
    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        if (this.transactionDate == null) {
            this.transactionDate = LocalDateTime.now();
        }
        if (this.status == null) {
            this.status = TransactionStatus.PENDING;
        }
    }
    
    // İşlem güncelleme tarihini otomatik olarak ayarla
    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
    
    // İşlem tipi enum
    public enum TransactionType {
        INCOME,       // Gelir
        EXPENSE       // Gider
    }
    
    // İşlem durumu enum
    public enum TransactionStatus {
        PENDING,      // Beklemede
        APPROVED,     // Onaylandı
        REJECTED,     // Reddedildi
        CANCELLED     // İptal edildi
    }
} 