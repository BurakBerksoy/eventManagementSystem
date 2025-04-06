package com.example.cmManagementSystem.service;

import com.example.cmManagementSystem.dto.UserDto;
import com.example.cmManagementSystem.dto.auth.AuthRequest;
import com.example.cmManagementSystem.dto.auth.AuthResponse;
import com.example.cmManagementSystem.dto.auth.RegisterRequest;

public interface AuthService {
    
    /**
     * Kullanıcıyı sisteme kaydeder
     * 
     * @param request Kayıt bilgileri
     * @return Kimlik doğrulama yanıtı
     */
    AuthResponse register(RegisterRequest request);
    
    /**
     * Kullanıcı kimlik doğrulaması yapar
     * 
     * @param request Kimlik doğrulama bilgileri
     * @return Kimlik doğrulama yanıtı
     */
    AuthResponse authenticate(AuthRequest request);
    
    /**
     * Refresh token ile yeni token oluşturur
     * 
     * @param refreshToken Refresh token
     * @return Kimlik doğrulama yanıtı
     */
    AuthResponse refreshToken(String refreshToken);
    
    /**
     * Token'ın geçerliliğini kontrol eder
     * 
     * @param token JWT token
     * @return UserDto Token geçerliyse kullanıcı bilgilerini döner
     */
    UserDto validateToken(String token);
    
    /**
     * Kullanıcının oturumunu sonlandırır
     * 
     * @param token JWT token
     */
    void logout(String token);
} 