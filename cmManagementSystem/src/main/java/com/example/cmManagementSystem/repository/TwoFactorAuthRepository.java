package com.example.cmManagementSystem.repository;

import com.example.cmManagementSystem.entity.TwoFactorAuth;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface TwoFactorAuthRepository extends JpaRepository<TwoFactorAuth, Long> {
    
    Optional<TwoFactorAuth> findByUserId(Long userId);
    
    Optional<TwoFactorAuth> findByUserEmail(String email);
    
    Optional<TwoFactorAuth> findBySecretKey(String secretKey);
} 