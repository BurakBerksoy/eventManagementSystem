package com.example.cmManagementSystem.mapper;

import com.example.cmManagementSystem.dto.UserDto;
import com.example.cmManagementSystem.entity.User;
import org.springframework.stereotype.Component;

@Component
public class UserMapper {
    
    /**
     * User entity'sini UserDto'ya dönüştürür
     *
     * @param user User entity
     * @return UserDto
     */
    public UserDto toDto(User user) {
        if (user == null) {
            return null;
        }
        
        return UserDto.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .studentId(user.getStudentId())
                .department(user.getDepartment())
                .bio(user.getBio())
                .phoneNumber(user.getPhoneNumber())
                .role(user.getRole())
                .joinDate(user.getJoinDate())
                .lastLogin(user.getLastLogin())
                .profileImage(user.getProfileImage())
                .enabled(user.isEnabled())
                .accountNonExpired(user.isAccountNonExpired())
                .accountNonLocked(user.isAccountNonLocked())
                .credentialsNonExpired(user.isCredentialsNonExpired())
                .build();
    }
    
    /**
     * UserDto'yu User entity'ye dönüştürür (yeni entity oluşturur)
     *
     * @param userDto UserDto
     * @return User entity
     */
    public User toEntity(UserDto userDto) {
        if (userDto == null) {
            return null;
        }
        
        return User.builder()
                .id(userDto.getId())
                .name(userDto.getName())
                .email(userDto.getEmail())
                .password(userDto.getPassword()) // Dikkat: şifre koruması için ek işlem gerekebilir
                .studentId(userDto.getStudentId())
                .department(userDto.getDepartment())
                .bio(userDto.getBio())
                .phoneNumber(userDto.getPhoneNumber())
                .role(userDto.getRole())
                .joinDate(userDto.getJoinDate())
                .lastLogin(userDto.getLastLogin())
                .profileImage(userDto.getProfileImage())
                .enabled(userDto.isEnabled())
                .accountNonExpired(userDto.isAccountNonExpired())
                .accountNonLocked(userDto.isAccountNonLocked())
                .credentialsNonExpired(userDto.isCredentialsNonExpired())
                .build();
    }
    
    /**
     * UserDto değerlerini mevcut User entity'sine kopyalar (update)
     *
     * @param userDto Kaynak UserDto
     * @param user Hedef User entity
     */
    public void updateEntityFromDto(UserDto userDto, User user) {
        if (userDto == null || user == null) {
            return;
        }
        
        if (userDto.getName() != null) {
            user.setName(userDto.getName());
        }
        
        if (userDto.getEmail() != null) {
            user.setEmail(userDto.getEmail());
        }
        
        if (userDto.getPassword() != null) {
            user.setPassword(userDto.getPassword()); // Dikkat: şifre koruması için ek işlem gerekebilir
        }
        
        if (userDto.getStudentId() != null) {
            user.setStudentId(userDto.getStudentId());
        }
        
        if (userDto.getDepartment() != null) {
            user.setDepartment(userDto.getDepartment());
        }
        
        if (userDto.getBio() != null) {
            user.setBio(userDto.getBio());
        }
        
        if (userDto.getPhoneNumber() != null) {
            user.setPhoneNumber(userDto.getPhoneNumber());
        }
        
        if (userDto.getRole() != null) {
            user.setRole(userDto.getRole());
        }
        
        if (userDto.getProfileImage() != null) {
            user.setProfileImage(userDto.getProfileImage());
        }
    }
} 