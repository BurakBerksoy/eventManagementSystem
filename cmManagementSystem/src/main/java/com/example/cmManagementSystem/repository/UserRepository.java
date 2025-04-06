package com.example.cmManagementSystem.repository;

import com.example.cmManagementSystem.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    
    /**
     * E-posta adresine göre kullanıcı arar
     * 
     * @param email Kullanıcı e-posta adresi
     * @return Bulunan kullanıcı (Optional)
     */
    Optional<User> findByEmail(String email);
    
    /**
     * Öğrenci numarasına göre kullanıcı arar
     * 
     * @param studentId Kullanıcı öğrenci numarası
     * @return Bulunan kullanıcı (Optional)
     */
    Optional<User> findByStudentId(String studentId);
    
    /**
     * E-posta adresi varlığını kontrol eder
     * 
     * @param email Kontrol edilecek e-posta adresi
     * @return E-posta adresi kullanılıyorsa true, değilse false
     */
    boolean existsByEmail(String email);
    
    /**
     * Öğrenci numarası varlığını kontrol eder
     * 
     * @param studentId Kontrol edilecek öğrenci numarası
     * @return Öğrenci numarası kullanılıyorsa true, değilse false
     */
    boolean existsByStudentId(String studentId);
} 