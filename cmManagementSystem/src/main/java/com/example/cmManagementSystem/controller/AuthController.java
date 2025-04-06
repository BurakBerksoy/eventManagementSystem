package com.example.cmManagementSystem.controller;

import com.example.cmManagementSystem.dto.UserDto;
import com.example.cmManagementSystem.dto.auth.AuthRequest;
import com.example.cmManagementSystem.dto.auth.AuthResponse;
import com.example.cmManagementSystem.dto.auth.RegisterRequest;
import com.example.cmManagementSystem.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/auth")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173", "http://127.0.0.1:3000"}, allowCredentials = "true")
@RequiredArgsConstructor
@Slf4j
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest request, BindingResult bindingResult) {
        // Doğrulama hataları varsa
        if (bindingResult.hasErrors()) {
            Map<String, String> errors = new HashMap<>();
            bindingResult.getAllErrors().forEach(error -> {
                String fieldName = error instanceof FieldError ? ((FieldError) error).getField() : error.getObjectName();
                String errorMessage = error.getDefaultMessage();
                errors.put(fieldName, errorMessage);
                log.error("Validasyon hatası: {} - {}", fieldName, errorMessage);
            });
            return ResponseEntity.badRequest().body(Map.of("success", false, "fieldErrors", errors));
        }
        
        // Başarılı işlem
        try {
            AuthResponse response = authService.register(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            log.error("Kayıt işlemi sırasında hata: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody AuthRequest request) {
        log.info("Login isteği alındı: {}", request.getEmail());
        try {
            AuthResponse response = authService.authenticate(request);
            log.info("Kullanıcı başarıyla giriş yaptı: {}", request.getEmail());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Login hatası: {} - {}", request.getEmail(), e.getMessage());
            
            // Hata mesajını içeren cevap döndür
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", true);
            errorResponse.put("message", e.getMessage());
            
            // Hataya göre farklı durum kodları kullan
            if (e.getMessage().contains("Kullanıcı bulunamadı")) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(errorResponse);
            } else if (e.getMessage().contains("Geçersiz e-posta veya şifre")) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(errorResponse);
            } else {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(errorResponse);
            }
        }
    }

    @PostMapping("/refresh-token")
    public ResponseEntity<AuthResponse> refreshToken(@RequestHeader("Authorization") String refreshToken) {
        if (refreshToken != null && refreshToken.startsWith("Bearer ")) {
            String token = refreshToken.substring(7);
            return ResponseEntity.ok(authService.refreshToken(token));
        }
        return ResponseEntity.badRequest().build();
    }

    @GetMapping("/validate-token")
    public ResponseEntity<UserDto> validateToken(@RequestHeader("Authorization") String token) {
        if (token != null && token.startsWith("Bearer ")) {
            token = token.substring(7);
            return ResponseEntity.ok(authService.validateToken(token));
        }
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(@RequestHeader("Authorization") String token) {
        if (token != null && token.startsWith("Bearer ")) {
            token = token.substring(7);
            authService.logout(token);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.badRequest().build();
    }

    @GetMapping("/current-user")
    public ResponseEntity<UserDto> getCurrentUser(@RequestHeader("Authorization") String token) {
        log.info("Current-user isteği alındı");
        try {
            if (token != null && token.startsWith("Bearer ")) {
                token = token.substring(7);
                UserDto userDto = authService.validateToken(token);
                log.info("Kullanıcı bilgisi alındı: {}", userDto.getEmail());
                return ResponseEntity.ok(userDto);
            }
            log.warn("Geçersiz token formatı");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        } catch (Exception e) {
            log.error("Current-user hatası: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<?> handleValidationExceptions(MethodArgumentNotValidException ex) {
        Map<String, String> errors = new HashMap<>();
        
        ex.getBindingResult().getAllErrors().forEach(error -> {
            String fieldName = error instanceof FieldError ? ((FieldError) error).getField() : error.getObjectName();
            String errorMessage = error.getDefaultMessage();
            errors.put(fieldName, errorMessage);
        });
        
        return ResponseEntity.badRequest().body(Map.of("success", false, "fieldErrors", errors));
    }
} 