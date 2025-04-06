package com.example.cmManagementSystem.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Entity
@Table(name = "users")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class User implements UserDetails {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String name;
    
    @Column(nullable = false, unique = true)
    private String email;
    
    @Column(nullable = false)
    private String password;
    
    @Column(name = "student_id", unique = true)
    private String studentId;
    
    @Column
    private String department;
    
    @Column
    private String bio;
    
    @Column(name = "phone_number")
    private String phoneNumber;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;
    
    @Column(name = "join_date")
    private LocalDateTime joinDate;
    
    @Column(name = "last_login")
    private LocalDateTime lastLogin;
    
    @Column(name = "profile_image")
    private String profileImage;
    
    @Column(nullable = false)
    private Boolean enabled = true;
    
    @Column(name = "account_non_expired", nullable = false)
    private Boolean accountNonExpired = true;
    
    @Column(name = "account_non_locked", nullable = false)
    private Boolean accountNonLocked = true;
    
    @Column(name = "credentials_non_expired", nullable = false)
    private Boolean credentialsNonExpired = true;
    
    @Column(name = "email_verified")
    private Boolean emailVerified = false;
    
    @Column(name = "verification_token")
    private String verificationToken;
    
    @Column(name = "verification_token_expiry")
    private LocalDateTime verificationTokenExpiry;
    
    @Column(name = "reset_password_token")
    private String resetPasswordToken;
    
    @Column(name = "reset_password_token_expiry")
    private LocalDateTime resetPasswordTokenExpiry;
    
    @Column(name = "privacy_policy_accepted")
    private Boolean privacyPolicyAccepted = false;
    
    @Column(name = "terms_accepted")
    private Boolean termsAccepted = false;
    
    @Column(name = "marketing_consent")
    private Boolean marketingConsent = false;
    
    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private TwoFactorAuth twoFactorAuth;
    
    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private NotificationPreference notificationPreference;
    
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL)
    private Set<EventParticipation> participations = new HashSet<>();
    
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL)
    private Set<ClubMembership> memberships = new HashSet<>();
    
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL)
    private Set<Certificate> certificates = new HashSet<>();
    
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL)
    private Set<Notification> notifications = new HashSet<>();
    
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_" + this.role.name()));
    }
    
    @Override
    public String getUsername() {
        return this.email;
    }
    
    @Override
    public String getPassword() {
        return this.password;
    }
    
    /**
     * Kullanıcının tam adını döndürür
     * 
     * @return Kullanıcı adı
     */
    public String getFullName() {
        return this.name;
    }
    
    @Override
    public boolean isAccountNonExpired() {
        return this.accountNonExpired != null ? this.accountNonExpired : true;
    }
    
    @Override
    public boolean isAccountNonLocked() {
        return this.accountNonLocked != null ? this.accountNonLocked : true;
    }
    
    @Override
    public boolean isCredentialsNonExpired() {
        return this.credentialsNonExpired != null ? this.credentialsNonExpired : true;
    }
    
    @Override
    public boolean isEnabled() {
        return this.enabled != null ? this.enabled : false;
    }
    
    // Kullanıcı oluşturma tarihini otomatik olarak ayarla
    @PrePersist
    public void prePersist() {
        this.joinDate = LocalDateTime.now();
    }
    
    // Sistemdeki kullanıcı rolleri
    public enum Role {
        // Temel roller
        STUDENT,               // Öğrenci
        ADMIN,                 // Sistem Yöneticisi
        
        // Kulüp rolleri
        CLUB_PRESIDENT,        // Kulüp Başkanı
        CLUB_ACCOUNTANT,       // Muhasebeci
        CLUB_EXTERNAL_AFFAIRS, // Dış İlişkiler Sorumlusu
        CLUB_CATERING,         // İkram Sorumlusu
        CLUB_DESIGN,           // Dijital Tasarım Sorumlusu
        CLUB_REPORTER,         // Raporcu
        CLUB_MEMBER            // Genel Üye
    }
    
    // toString metodunu şifreyi göstermeyecek şekilde ezme
    @Override
    public String toString() {
        return "User{" +
                "id=" + id +
                ", name='" + name + '\'' +
                ", email='" + email + '\'' +
                ", password='[PROTECTED]'" +
                ", studentId='" + studentId + '\'' +
                ", department='" + department + '\'' +
                ", role=" + role +
                '}';
    }
} 