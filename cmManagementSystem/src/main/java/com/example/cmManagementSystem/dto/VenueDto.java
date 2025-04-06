package com.example.cmManagementSystem.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
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
public class VenueDto {
    
    private Long id;
    
    @NotBlank(message = "Mekan adı zorunludur")
    private String name;
    
    private String description;
    
    @NotBlank(message = "Adres zorunludur")
    private String address;
    
    private String city;
    
    private String district;
    
    private String postalCode;
    
    private String country;
    
    private String latitude;
    
    private String longitude;
    
    @Positive(message = "Kapasite pozitif olmalıdır")
    private Integer capacity;
    
    private String contactPerson;
    
    @Email(message = "Geçerli bir e-posta adresi giriniz")
    private String contactEmail;
    
    private String contactPhone;
    
    private BigDecimal rentalFee;
    
    private Boolean isUniversityVenue;
    
    private String equipmentInfo;
    
    private String accessibilityInfo;
    
    private String imageUrl;
    
    private String availableTimes;
    
    private Long createdById;
    
    private String createdByName;
    
    private LocalDateTime createdAt;
    
    private LocalDateTime updatedAt;
    
    private boolean isAvailable;
    
    private Integer upcomingReservationsCount;
} 