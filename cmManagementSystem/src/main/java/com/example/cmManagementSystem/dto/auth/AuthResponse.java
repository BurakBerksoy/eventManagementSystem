package com.example.cmManagementSystem.dto.auth;

import com.example.cmManagementSystem.dto.UserDto;
import com.example.cmManagementSystem.entity.User;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AuthResponse {

    private String accessToken;
    private String refreshToken;
    private UserDto user;
    private String tokenType;
    private String message;
    private boolean success;

    public static AuthResponse of(String token, String refreshToken, UserDto user) {
        return AuthResponse.builder()
                .accessToken(token)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .user(user)
                .success(true)
                .message("İşlem başarılı")
                .build();
    }
} 