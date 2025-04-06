package com.example.cmManagementSystem.repository;

import com.example.cmManagementSystem.entity.Certificate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CertificateRepository extends JpaRepository<Certificate, Long> {
    
    List<Certificate> findByUserId(Long userId);
    
    List<Certificate> findByEventId(Long eventId);
    
    List<Certificate> findByStatus(Certificate.Status status);
    
    Optional<Certificate> findByCode(String code);
    
    Optional<Certificate> findByEventIdAndUserId(Long eventId, Long userId);
} 