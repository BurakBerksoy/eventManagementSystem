package com.example.cmManagementSystem.service;

import com.example.cmManagementSystem.dto.TwoFactorAuthDto;
import com.example.cmManagementSystem.entity.TwoFactorAuth;

import java.util.Optional;

public interface TwoFactorAuthService {
    
    /**
     * Kullanıcı ID'ye göre 2FA bilgisini getirir
     * 
     * @param userId Kullanıcı ID
     * @return 2FA bilgisi
     */
    TwoFactorAuthDto findByUserId(Long userId);
    
    /**
     * Kullanıcı e-postasına göre 2FA bilgisini getirir
     * 
     * @param email Kullanıcı e-postası
     * @return 2FA bilgisi
     */
    TwoFactorAuthDto findByUserEmail(String email);
    
    /**
     * Kullanıcı için 2FA yapılandırması oluşturur
     * 
     * @param userId Kullanıcı ID
     * @param method 2FA metodu
     * @return Oluşturulan 2FA yapılandırması
     */
    TwoFactorAuthDto setupTwoFactorAuth(Long userId, TwoFactorAuth.AuthMethod method);
    
    /**
     * Kullanıcı için TOTP (Time-based One-Time Password) yapılandırması oluşturur
     * 
     * @param userId Kullanıcı ID
     * @return Oluşturulan TOTP yapılandırması
     */
    TwoFactorAuthDto setupTotpAuth(Long userId);
    
    /**
     * 2FA yapılandırmasını etkinleştirir
     * 
     * @param userId Kullanıcı ID
     * @param verificationCode Doğrulama kodu
     * @return Etkinleştirilen 2FA yapılandırması
     */
    TwoFactorAuthDto enableTwoFactorAuth(Long userId, String verificationCode);
    
    /**
     * 2FA yapılandırmasını devre dışı bırakır
     * 
     * @param userId Kullanıcı ID
     * @param verificationCode Doğrulama kodu
     * @return Devre dışı bırakılan 2FA yapılandırması
     */
    TwoFactorAuthDto disableTwoFactorAuth(Long userId, String verificationCode);
    
    /**
     * 2FA metodunu değiştirir
     * 
     * @param userId Kullanıcı ID
     * @param method Yeni 2FA metodu
     * @param verificationCode Doğrulama kodu
     * @return Güncellenen 2FA yapılandırması
     */
    TwoFactorAuthDto changeAuthMethod(Long userId, TwoFactorAuth.AuthMethod method, String verificationCode);
    
    /**
     * 2FA telefon numarasını günceller
     * 
     * @param userId Kullanıcı ID
     * @param phoneNumber Yeni telefon numarası
     * @param verificationCode Doğrulama kodu
     * @return Güncellenen 2FA yapılandırması
     */
    TwoFactorAuthDto updatePhoneNumber(Long userId, String phoneNumber, String verificationCode);
    
    /**
     * 2FA doğrulama kodu gönderir
     * 
     * @param userId Kullanıcı ID
     * @return Doğrulama kodu gönderildi mi
     */
    boolean sendVerificationCode(Long userId);
    
    /**
     * 2FA doğrulama kodunu doğrular
     * 
     * @param userId Kullanıcı ID
     * @param verificationCode Doğrulama kodu
     * @return Doğrulama başarılı mı
     */
    boolean verifyCode(Long userId, String verificationCode);
    
    /**
     * Yedek kodları yeniden oluşturur
     * 
     * @param userId Kullanıcı ID
     * @param verificationCode Doğrulama kodu
     * @return Güncellenen 2FA yapılandırması
     */
    TwoFactorAuthDto regenerateBackupCodes(Long userId, String verificationCode);
    
    /**
     * QR kod URL'sini oluşturur
     * 
     * @param userId Kullanıcı ID
     * @return QR kod URL'si
     */
    String generateQrCodeUrl(Long userId);
    
    /**
     * 2FA yapılandırmasını siler
     * 
     * @param userId Kullanıcı ID
     */
    void deleteTwoFactorAuth(Long userId);
} 