package com.example.cmManagementSystem.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "caterings")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Catering {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "event_id", nullable = false)
    private Event event;
    
    @Column(nullable = false)
    private String name;
    
    @Column(length = 1000)
    private String description;
    
    @Column(name = "supplier_name")
    private String supplierName;
    
    @Column(name = "supplier_contact")
    private String supplierContact;
    
    @Column(name = "supplier_email")
    private String supplierEmail;
    
    @Column(name = "supplier_phone")
    private String supplierPhone;
    
    @Column(name = "order_date")
    private LocalDateTime orderDate;
    
    @Column(name = "delivery_date")
    private LocalDateTime deliveryDate;
    
    @Column
    private BigDecimal cost;
    
    @Column(name = "number_of_people")
    private Integer numberOfPeople;
    
    @Column(name = "dietary_options")
    private String dietaryOptions;
    
    @Column(name = "menu_details", length = 2000)
    private String menuDetails;
    
    @Column(name = "special_requests", length = 1000)
    private String specialRequests;
    
    @Column(name = "order_status")
    @Enumerated(EnumType.STRING)
    private OrderStatus orderStatus;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by")
    private User createdBy;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    // İlk oluşturma zamanını ayarla
    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        if (this.orderStatus == null) {
            this.orderStatus = OrderStatus.PENDING;
        }
    }
    
    // Güncelleme zamanını ayarla
    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
    
    // Sipariş durumu
    public enum OrderStatus {
        PENDING,      // Beklemede
        ORDERED,      // Sipariş verildi
        CONFIRMED,    // Onaylandı
        PREPARING,    // Hazırlanıyor
        DELIVERED,    // Teslim edildi
        COMPLETED,    // Tamamlandı
        CANCELLED     // İptal edildi
    }
} 