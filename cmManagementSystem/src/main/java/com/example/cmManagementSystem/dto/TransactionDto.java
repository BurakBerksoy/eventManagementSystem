package com.example.cmManagementSystem.dto;

import com.example.cmManagementSystem.entity.Transaction;
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
public class TransactionDto {
    
    private Long id;
    
    @NotNull(message = "Kulüp ID zorunludur")
    private Long clubId;
    
    private String clubName;
    
    private Long budgetId;
    
    private Long eventId;
    
    private String eventName;
    
    @NotNull(message = "Tutar zorunludur")
    @Positive(message = "Tutar pozitif olmalıdır")
    private BigDecimal amount;
    
    @NotNull(message = "İşlem tarihi zorunludur")
    private LocalDateTime transactionDate;
    
    @NotNull(message = "İşlem tipi zorunludur")
    private Transaction.TransactionType type;
    
    private String description;
    
    private String category;
    
    private String receiptUrl;
    
    private String invoiceNumber;
    
    private String vendorName;
    
    private String paymentMethod;
    
    private Long createdById;
    
    private String createdByName;
    
    private Long approvedById;
    
    private String approvedByName;
    
    private LocalDateTime approvalDate;
    
    private Transaction.TransactionStatus status;
    
    private LocalDateTime createdAt;
    
    private LocalDateTime updatedAt;
} 