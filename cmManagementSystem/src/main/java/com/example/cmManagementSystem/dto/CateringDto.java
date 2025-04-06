package com.example.cmManagementSystem.dto;

import com.example.cmManagementSystem.entity.Catering;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CateringDto {
    
    private Long id;
    
    @NotNull(message = "Etkinlik ID zorunludur")
    private Long eventId;
    
    private String eventTitle;
    
    @NotBlank(message = "İkram adı zorunludur")
    private String name;
    
    private String description;
    
    private String supplierName;
    
    private String supplierContact;
    
    private String supplierEmail;
    
    private String supplierPhone;
    
    private LocalDateTime orderDate;
    
    private LocalDateTime deliveryDate;
    
    @Positive(message = "Maliyet pozitif olmalıdır")
    private BigDecimal cost;
    
    @Positive(message = "Kişi sayısı pozitif olmalıdır")
    private Integer numberOfPeople;
    
    private String dietaryOptions;
    
    private String menuDetails;
    
    private String specialRequests;
    
    private Catering.OrderStatus orderStatus;
    
    private Long createdById;
    
    private String createdByName;
    
    private LocalDateTime createdAt;
    
    private LocalDateTime updatedAt;
} 