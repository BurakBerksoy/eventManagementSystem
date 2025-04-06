package com.example.cmManagementSystem.dto;

import com.example.cmManagementSystem.entity.User;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserDto {
    
    private Long id;
    
    @NotBlank(message = "İsim alanı zorunludur")
    @Size(min = 3, max = 100, message = "İsim 3-100 karakter arasında olmalıdır")
    private String name;
    
    @NotBlank(message = "E-posta alanı zorunludur")
    @Email(message = "Geçerli bir e-posta adresi giriniz")
    private String email;
    
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    @Size(min = 6, message = "Şifre en az 6 karakter olmalıdır")
    private String password;
    
    private String studentId;
    
    private String department;
    
    private String bio;
    
    private String phoneNumber;
    
    private User.Role role;
    
    private LocalDateTime joinDate;
    
    private LocalDateTime lastLogin;
    
    private String profileImage;
    
    private String token;
    
    // Security properties (erişim kontrol amacıyla)
    @JsonIgnore
    private boolean enabled;
    
    @JsonIgnore
    private boolean accountNonExpired;
    
    @JsonIgnore
    private boolean accountNonLocked;
    
    @JsonIgnore
    private boolean credentialsNonExpired;
    
    // User entity'sinden UserDto oluşturmak için constructor
    public UserDto(User user) {
        this.id = user.getId();
        this.name = user.getName();
        this.email = user.getEmail();
        this.studentId = user.getStudentId();
        this.department = user.getDepartment();
        this.bio = user.getBio();
        this.phoneNumber = user.getPhoneNumber();
        this.role = user.getRole();
        this.joinDate = user.getJoinDate();
        this.lastLogin = user.getLastLogin();
        this.profileImage = user.getProfileImage();
        this.enabled = user.isEnabled();
        this.accountNonExpired = user.isAccountNonExpired();
        this.accountNonLocked = user.isAccountNonLocked();
        this.credentialsNonExpired = user.isCredentialsNonExpired();
    }
} 