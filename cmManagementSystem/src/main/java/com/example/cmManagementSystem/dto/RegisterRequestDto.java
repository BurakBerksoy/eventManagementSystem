package com.example.cmManagementSystem.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RegisterRequestDto {
    
    @NotBlank(message = "İsim alanı zorunludur")
    @Size(min = 3, max = 100, message = "İsim 3-100 karakter arasında olmalıdır")
    private String name;
    
    @NotBlank(message = "E-posta alanı zorunludur")
    @Email(message = "Geçerli bir e-posta adresi giriniz")
    private String email;
    
    @NotBlank(message = "Şifre alanı zorunludur")
    @Size(min = 4, message = "Şifre en az 4 karakter olmalıdır")
    private String password;
    
    private String studentId;
    
    private String department;
    
    private String phoneNumber;
} 