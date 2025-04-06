package com.example.cmManagementSystem.repository;

import com.example.cmManagementSystem.entity.Catering;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface CateringRepository extends JpaRepository<Catering, Long> {
    
    List<Catering> findByEventId(Long eventId);
    
    List<Catering> findBySupplierName(String supplierName);
    
    List<Catering> findByOrderStatus(Catering.OrderStatus orderStatus);
    
    List<Catering> findByDeliveryDateBetween(LocalDateTime startDate, LocalDateTime endDate);
    
    List<Catering> findByCreatedById(Long createdById);
} 