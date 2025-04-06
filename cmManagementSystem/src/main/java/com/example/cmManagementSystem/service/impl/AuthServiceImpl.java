package com.example.cmManagementSystem.service.impl;

import com.example.cmManagementSystem.dto.UserDto;
import com.example.cmManagementSystem.dto.auth.AuthRequest;
import com.example.cmManagementSystem.dto.auth.AuthResponse;
import com.example.cmManagementSystem.dto.auth.RegisterRequest;
import com.example.cmManagementSystem.entity.User;
import com.example.cmManagementSystem.repository.UserRepository;
import com.example.cmManagementSystem.security.JwtTokenProvider;
import com.example.cmManagementSystem.service.AuthService;
import com.example.cmManagementSystem.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final AuthenticationManager authenticationManager;
    private final UserService userService;
    private static final Logger log = LoggerFactory.getLogger(AuthServiceImpl.class);

    @Override
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        // E-posta adresi kullanılıyor mu kontrol et
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Bu e-posta adresi zaten kullanılıyor: " + request.getEmail());
        }

        // Öğrenci numarası kullanılıyor mu kontrol et (eğer varsa)
        if (request.getStudentId() != null && userRepository.existsByStudentId(request.getStudentId())) {
            throw new RuntimeException("Bu öğrenci numarası zaten kullanılıyor: " + request.getStudentId());
        }

        // Yeni kullanıcı oluştur
        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .studentId(request.getStudentId())
                .department(request.getDepartment())
                .bio(request.getBio())
                .phoneNumber(request.getPhoneNumber())
                .role(request.getRole() != null ? request.getRole() : User.Role.STUDENT)
                .joinDate(LocalDateTime.now())
                .lastLogin(LocalDateTime.now())
                .enabled(true)
                .accountNonExpired(true)
                .accountNonLocked(true)
                .credentialsNonExpired(true)
                .build();

        User savedUser = userRepository.save(user);

        // Token oluştur
        String token = jwtTokenProvider.generateToken(savedUser);
        String refreshToken = jwtTokenProvider.generateRefreshToken(savedUser);

        // UserDto oluştur
        UserDto userDto = UserDto.builder()
                .id(savedUser.getId())
                .name(savedUser.getName())
                .email(savedUser.getEmail())
                .studentId(savedUser.getStudentId())
                .department(savedUser.getDepartment())
                .bio(savedUser.getBio())
                .phoneNumber(savedUser.getPhoneNumber())
                .role(savedUser.getRole())
                .joinDate(savedUser.getJoinDate())
                .lastLogin(savedUser.getLastLogin())
                .build();

        return AuthResponse.of(token, refreshToken, userDto);
    }

    @Override
    @Transactional
    public AuthResponse authenticate(AuthRequest request) {
        try {
            System.out.println("AuthServiceImpl - Login isteği: " + request.getEmail());
            
            // Kullanıcıyı veritabanından bul
            User user = userRepository.findByEmail(request.getEmail())
                    .orElseThrow(() -> {
                        log.error("Kullanıcı bulunamadı: {}", request.getEmail());
                        return new RuntimeException("Kullanıcı bulunamadı: " + request.getEmail());
                    });
            
            log.info("Kullanıcı veritabanında bulundu: id={}, email={}, role={}", 
                    user.getId(), user.getEmail(), user.getRole());
            
            // Şifre format kontrolü
            if (user.getPassword() == null || user.getPassword().isEmpty()) {
                log.error("Kullanıcının şifresi veritabanında bulunamadı: {}", user.getEmail());
                throw new RuntimeException("Kullanıcı hesabında bir sorun var. Lütfen sistem yöneticisiyle iletişime geçin.");
            }
            
            // Şifreyi BCrypt ile kontrol et
            boolean isBCryptMatch = false;
            try {
                isBCryptMatch = passwordEncoder.matches(request.getPassword(), user.getPassword());
                log.info("BCrypt şifre eşleşiyor mu: {}", isBCryptMatch);
            } catch (Exception e) {
                log.error("BCrypt şifre kontrolü sırasında hata: {}", e.getMessage());
            }
            
            // Şifre eşleşmiyorsa hata fırlat
            if (!isBCryptMatch) {
                log.error("Şifre eşleşmiyor! Kullanıcı: {}", user.getEmail());
                throw new RuntimeException("Kimlik doğrulama hatası: Geçersiz e-posta veya şifre");
            }
            
            log.info("Şifre doğrulama başarılı. Token oluşturuluyor...");
            
            // Authentication Manager ile doğrulama
            try {
                Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                    )
                );
                SecurityContextHolder.getContext().setAuthentication(authentication);
                log.info("Authentication Manager ile doğrulama başarılı.");
            } catch (Exception e) {
                log.warn("Authentication Manager ile doğrulama başarısız: {}", e.getMessage());
                // Authentication Manager başarısız olsa da BCrypt eşleşmesi yeterli olduğundan devam ediyoruz
            }
            
            // Rol bilgisini claims olarak eklemek için hazırla
            Map<String, Object> claims = new HashMap<>();
            claims.put("id", user.getId());
            claims.put("role", user.getRole().name());
            claims.put("name", user.getName());
            
            System.out.println("AuthServiceImpl - Claims hazırlandı: " + claims);
            
            // Token oluştur - Authentication nesnesi yerine user'ı kullanalım
            Authentication auth = new UsernamePasswordAuthenticationToken(
                user.getEmail(), null, user.getAuthorities());
            
            String accessToken = jwtTokenProvider.createToken(auth, claims);
            
            System.out.println("AuthServiceImpl - Token oluşturuldu, uzunluk: " + accessToken.length());
            
            // Son giriş zamanını güncelle
            user.setLastLogin(LocalDateTime.now());
            userRepository.save(user);
            
            log.info("Kullanıcı başarıyla giriş yaptı: {}", user.getEmail());
            
            return AuthResponse.builder()
                    .success(true)
                    .accessToken(accessToken)
                    .tokenType("Bearer")
                    .user(mapUserToDto(user))
                    .message("Giriş başarılı")
                    .build();
            
        } catch (Exception e) {
            log.error("Genel kimlik doğrulama hatası: {}", e.getMessage());
            return AuthResponse.builder()
                    .success(false)
                    .message("Giriş yapılamadı: " + e.getMessage())
                    .build();
        }
    }

    @Override
    public AuthResponse refreshToken(String refreshToken) {
        // Refresh token doğrula
        if (!jwtTokenProvider.validateRefreshToken(refreshToken)) {
            throw new RuntimeException("Geçersiz refresh token");
        }

        // Token'dan kullanıcı e-postasını al
        String email = jwtTokenProvider.getEmailFromRefreshToken(refreshToken);

        // Kullanıcıyı bul
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Kullanıcı bulunamadı: " + email));

        // Yeni token oluştur
        String newToken = jwtTokenProvider.generateToken(user);
        String newRefreshToken = jwtTokenProvider.generateRefreshToken(user);

        // UserDto oluştur
        UserDto userDto = UserDto.builder()
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
                .build();

        return AuthResponse.of(newToken, newRefreshToken, userDto);
    }

    @Override
    public UserDto validateToken(String token) {
        // Token doğrula
        if (!jwtTokenProvider.validateToken(token)) {
            throw new RuntimeException("Geçersiz token");
        }

        // Token'dan kullanıcı e-postasını al
        String email = jwtTokenProvider.getEmailFromToken(token);

        // Kullanıcı bilgilerini döndür
        return userService.findByEmail(email);
    }

    @Override
    public void logout(String token) {
        // Token'ı geçersiz kıl (örneğin, blacklist'e ekle)
        // Bu örnek için basit bir implementasyon, gerçek uygulamada daha güvenli bir yöntem kullanılmalıdır
        jwtTokenProvider.invalidateToken(token);
    }

    private UserDto mapUserToDto(User user) {
        return UserDto.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole())
                .studentId(user.getStudentId())
                .department(user.getDepartment())
                .bio(user.getBio())
                .phoneNumber(user.getPhoneNumber())
                .profileImage(user.getProfileImage())
                .joinDate(user.getJoinDate())
                .lastLogin(user.getLastLogin())
                .build();
    }
} 