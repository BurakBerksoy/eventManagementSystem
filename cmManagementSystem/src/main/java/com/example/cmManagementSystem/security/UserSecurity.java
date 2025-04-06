package com.example.cmManagementSystem.security;

import com.example.cmManagementSystem.entity.User;
import com.example.cmManagementSystem.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class UserSecurity {
    
    private final UserService userService;
    
    /**
     * Giriş yapmış mevcut kullanıcının belirtilen ID'ye sahip kullanıcı olup olmadığını kontrol eder.
     * Bu method Spring Security'nin @PreAuthorize annotasyonuyla kullanılır.
     * 
     * @param userId İşlem yapılacak kullanıcının ID'si
     * @return Eğer mevcut giriş yapmış kullanıcı belirtilen ID'ye sahipse true, değilse false döner
     */
    public boolean isCurrentUser(Long userId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return false;
        }
        
        try {
            User currentUser = userService.getCurrentUser();
            return currentUser.getId().equals(userId);
        } catch (Exception e) {
            return false;
        }
    }
    
    /**
     * Giriş yapmış kullanıcının belirtilen role sahip olup olmadığını kontrol eder.
     * 
     * @param role Kontrol edilecek rol
     * @return Eğer kullanıcı belirtilen role sahipse true, değilse false döner
     */
    public boolean hasRole(String role) {
        try {
            User currentUser = userService.getCurrentUser();
            return currentUser.getRole().name().equals(role);
        } catch (Exception e) {
            return false;
        }
    }
    
    /**
     * Giriş yapmış kullanıcının kulüp başkanı olup olmadığını kontrol eder.
     * 
     * @return Eğer kullanıcı kulüp başkanı ise true, değilse false döner
     */
    public boolean isClubPresident() {
        try {
            User currentUser = userService.getCurrentUser();
            return currentUser.getRole() == User.Role.CLUB_PRESIDENT;
        } catch (Exception e) {
            return false;
        }
    }
    
    /**
     * Giriş yapmış kullanıcının admin olup olmadığını kontrol eder.
     * 
     * @return Eğer kullanıcı admin ise true, değilse false döner
     */
    public boolean isAdmin() {
        try {
            User currentUser = userService.getCurrentUser();
            return currentUser.getRole() == User.Role.ADMIN;
        } catch (Exception e) {
            return false;
        }
    }
} 