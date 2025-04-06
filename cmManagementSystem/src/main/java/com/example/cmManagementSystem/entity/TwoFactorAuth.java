package com.example.cmManagementSystem.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "two_factor_auth")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TwoFactorAuth {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @Column(name = "is_enabled")
    private Boolean isEnabled = false;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "method", nullable = false)
    private AuthMethod method = AuthMethod.EMAIL;
    
    @Column(name = "secret_key")
    private String secretKey;
    
    @Column(name = "backup_codes")
    private String backupCodes;
    
    @Column(name = "phone_number")
    private String phoneNumber;
    
    @Column(name = "last_used")
    private LocalDateTime lastUsed;
    
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
    
    // Doğrulama metodu
    public enum AuthMethod {
        EMAIL,      // E-posta
        SMS,        // SMS
        TOTP,       // Zaman tabanlı tek kullanımlık şifre (Google Authenticator vb.)
        BACKUP      // Yedek kodlar
    }
} 