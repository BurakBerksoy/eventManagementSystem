package com.example.cmManagementSystem.controller;

import com.example.cmManagementSystem.dto.UserDto;
import com.example.cmManagementSystem.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final UserService userService;
    private final PasswordEncoder passwordEncoder;

    /**
     * Admin kullanıcı şifrelerini sıfırlar
     * 
     * @param userId Şifresi sıfırlanacak kullanıcı ID
     * @param newPassword Yeni şifre
     * @return Güncellenmiş kullanıcı bilgileri
     */
    @PostMapping("/reset-password/{userId}")
    public ResponseEntity<UserDto> resetUserPassword(
            @PathVariable Long userId,
            @RequestParam String newPassword) {
        
        // Kullanıcıyı bul
        UserDto userDto = userService.findById(userId);
        
        // Şifreyi güncelle (şifre UserService'de hashlenecek)
        userDto.setPassword(newPassword);
        
        // Kullanıcıyı güncelle
        UserDto updatedUser = userService.updateUser(userId, userDto);
        
        return ResponseEntity.ok(updatedUser);
    }
} 