package com.example.cmManagementSystem.dto;

import com.example.cmManagementSystem.entity.Budget;
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
public class BudgetDto {
    
    private Long id;
    
    @NotNull(message = "Kulüp ID zorunludur")
    private Long clubId;
    
    private String clubName;
    
    @NotNull(message = "Toplam tutar zorunludur")
    @Positive(message = "Toplam tutar pozitif olmalıdır")
    private BigDecimal totalAmount;
    
    @NotNull(message = "Kullanılabilir tutar zorunludur")
    @Positive(message = "Kullanılabilir tutar pozitif olmalıdır")
    private BigDecimal availableAmount;
    
    @NotNull(message = "Tahsis edilmiş tutar zorunludur")
    @Positive(message = "Tahsis edilmiş tutar pozitif olmalıdır")
    private BigDecimal allocatedAmount;
    
    @NotBlank(message = "Akademik yıl zorunludur")
    private String academicYear;
    
    @NotNull(message = "Başlangıç tarihi zorunludur")
    private LocalDateTime startDate;
    
    @NotNull(message = "Bitiş tarihi zorunludur")
    private LocalDateTime endDate;
    
    private String description;
    
    private Budget.BudgetStatus status;
    
    private Long createdById;
    
    private String createdByName;
    
    private LocalDateTime createdAt;
    
    private LocalDateTime updatedAt;
} 