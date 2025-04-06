package com.example.cmManagementSystem.service.impl;

import com.example.cmManagementSystem.dto.UserDto;
import com.example.cmManagementSystem.entity.User;
import com.example.cmManagementSystem.repository.UserRepository;
import com.example.cmManagementSystem.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public UserDto findById(Long id) {
        return userRepository.findById(id)
                .map(this::convertToDto)
                .orElseThrow(() -> new RuntimeException("Kullanıcı bulunamadı: ID=" + id));
    }

    @Override
    public UserDto findByEmail(String email) {
        return userRepository.findByEmail(email)
                .map(this::convertToDto)
                .orElseThrow(() -> new RuntimeException("Kullanıcı bulunamadı: Email=" + email));
    }

    @Override
    public UserDto findByStudentId(String studentId) {
        return userRepository.findByStudentId(studentId)
                .map(this::convertToDto)
                .orElseThrow(() -> new RuntimeException("Kullanıcı bulunamadı: StudentID=" + studentId));
    }

    @Override
    public List<UserDto> findAll() {
        return userRepository.findAll().stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public UserDto createUser(UserDto userDto) {
        if (userRepository.existsByEmail(userDto.getEmail())) {
            throw new RuntimeException("Bu e-posta adresi zaten kullanılıyor: " + userDto.getEmail());
        }

        if (userDto.getStudentId() != null && userRepository.existsByStudentId(userDto.getStudentId())) {
            throw new RuntimeException("Bu öğrenci numarası zaten kullanılıyor: " + userDto.getStudentId());
        }

        User user = User.builder()
                .name(userDto.getName())
                .email(userDto.getEmail())
                .password(passwordEncoder.encode(userDto.getPassword()))
                .studentId(userDto.getStudentId())
                .department(userDto.getDepartment())
                .bio(userDto.getBio())
                .phoneNumber(userDto.getPhoneNumber())
                .role(userDto.getRole() != null ? userDto.getRole() : User.Role.STUDENT)
                .lastLogin(LocalDateTime.now())
                .build();

        User savedUser = userRepository.save(user);
        return convertToDto(savedUser);
    }

    @Override
    @Transactional
    public UserDto updateUser(Long id, UserDto userDto) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Kullanıcı bulunamadı. ID: " + id));
        
        // Temel bilgileri güncelle
        user.setName(userDto.getName());
        user.setDepartment(userDto.getDepartment());
        user.setBio(userDto.getBio());
        user.setPhoneNumber(userDto.getPhoneNumber());
        
        // Öğrenci numarası güncelleme
        if (userDto.getStudentId() != null && !userDto.getStudentId().equals(user.getStudentId())) {
            if (userRepository.existsByStudentId(userDto.getStudentId())) {
                throw new RuntimeException("Bu öğrenci numarası zaten kullanılıyor: " + userDto.getStudentId());
            }
            user.setStudentId(userDto.getStudentId());
        }
        
        // Profil fotoğrafı
        if (userDto.getProfileImage() != null) {
            user.setProfileImage(userDto.getProfileImage());
        }
        
        // Şifre güncelleme
        if (userDto.getPassword() != null && !userDto.getPassword().isEmpty()) {
            // Şifreyi güvenli şekilde hashleyerek kaydet
            user.setPassword(passwordEncoder.encode(userDto.getPassword()));
        }
        
        // Kullanıcıyı kaydet
        User updatedUser = userRepository.save(user);
        
        // DTO'ya dönüştür ve döndür
        return convertToDto(updatedUser);
    }

    @Override
    @Transactional
    public UserDto updateProfile(Long id, UserDto userDto) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Kullanıcı bulunamadı: ID=" + id));

        // Profil güncelleme işleminde sadece belirli alanlar güncellenebilir
        user.setName(userDto.getName());
        user.setDepartment(userDto.getDepartment());
        user.setBio(userDto.getBio());
        user.setPhoneNumber(userDto.getPhoneNumber());
        
        // Şifre güncellenmiş mi?
        if (userDto.getPassword() != null && !userDto.getPassword().isEmpty()) {
            // Şifreyi güvenli şekilde hashleyerek kaydet
            user.setPassword(passwordEncoder.encode(userDto.getPassword()));
        }

        User updatedUser = userRepository.save(user);
        return convertToDto(updatedUser);
    }

    @Override
    @Transactional
    public void deleteUser(Long id) {
        if (!userRepository.existsById(id)) {
            throw new RuntimeException("Kullanıcı bulunamadı: ID=" + id);
        }
        userRepository.deleteById(id);
    }

    @Override
    public boolean existsByEmail(String email) {
        return userRepository.existsByEmail(email);
    }

    @Override
    public boolean existsByStudentId(String studentId) {
        return userRepository.existsByStudentId(studentId);
    }

    @Override
    public User getCurrentUser() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        
        if (principal instanceof User) {
            return (User) principal;
        } else if (principal instanceof org.springframework.security.core.userdetails.UserDetails) {
            String email = ((org.springframework.security.core.userdetails.UserDetails) principal).getUsername();
            return userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("Oturum açmış kullanıcı bulunamadı"));
        }
        
        throw new RuntimeException("Oturum açmış kullanıcı bulunamadı");
    }

    // Entity -> DTO dönüşümü
    private UserDto convertToDto(User user) {
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
                .build();
    }
} 