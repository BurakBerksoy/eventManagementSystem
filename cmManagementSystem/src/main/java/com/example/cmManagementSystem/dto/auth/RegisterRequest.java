package com.example.cmManagementSystem.dto.auth;

import com.example.cmManagementSystem.entity.User;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class RegisterRequest {

    @NotBlank(message = "Ad boş olamaz")
    @Size(min = 3, max = 100, message = "Ad en az 3, en fazla 100 karakter olmalıdır")
    private String name;
    
    @NotBlank(message = "E-posta adresi boş olamaz")
    @Email(message = "Geçerli bir e-posta adresi giriniz")
    private String email;
    
    @NotBlank(message = "Şifre boş olamaz")
    @Size(min = 4, message = "Şifre en az 4 karakter olmalıdır")
    private String password;
    
    @Pattern(regexp = "^[0-9]{8}$", message = "Öğrenci numarası 8 haneli bir sayı olmalıdır")
    private String studentId;
    
    private String department;
    
    private String bio;
    
    @Pattern(regexp = "^(05)[0-9]{9}$", message = "Telefon numarası 05 ile başlamalı ve 11 haneli olmalıdır")
    private String phoneNumber;
    
    private User.Role role;
} 