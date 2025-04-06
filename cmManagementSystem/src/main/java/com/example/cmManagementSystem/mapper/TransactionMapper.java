package com.example.cmManagementSystem.mapper;

import com.example.cmManagementSystem.dto.TransactionDto;
import com.example.cmManagementSystem.entity.Transaction;
import org.springframework.stereotype.Component;

@Component
public class TransactionMapper {
    
    /**
     * Transaction entity'sini TransactionDto'ya dönüştürür
     *
     * @param transaction Transaction entity
     * @return TransactionDto
     */
    public TransactionDto toDto(Transaction transaction) {
        if (transaction == null) {
            return null;
        }
        
        return TransactionDto.builder()
                .id(transaction.getId())
                .clubId(transaction.getClub() != null ? transaction.getClub().getId() : null)
                .clubName(transaction.getClub() != null ? transaction.getClub().getName() : null)
                .budgetId(transaction.getBudget() != null ? transaction.getBudget().getId() : null)
                .eventId(transaction.getEvent() != null ? transaction.getEvent().getId() : null)
                .eventName(transaction.getEvent() != null ? transaction.getEvent().getTitle() : null)
                .amount(transaction.getAmount())
                .transactionDate(transaction.getTransactionDate())
                .type(transaction.getType())
                .description(transaction.getDescription())
                .category(transaction.getCategory())
                .receiptUrl(transaction.getReceiptUrl())
                .invoiceNumber(transaction.getInvoiceNumber())
                .vendorName(transaction.getVendorName())
                .paymentMethod(transaction.getPaymentMethod())
                .createdById(transaction.getCreatedBy() != null ? transaction.getCreatedBy().getId() : null)
                .createdByName(transaction.getCreatedBy() != null ? transaction.getCreatedBy().getName() : null)
                .approvedById(transaction.getApprovedBy() != null ? transaction.getApprovedBy().getId() : null)
                .approvedByName(transaction.getApprovedBy() != null ? transaction.getApprovedBy().getName() : null)
                .approvalDate(transaction.getApprovalDate())
                .status(transaction.getStatus())
                .createdAt(transaction.getCreatedAt())
                .updatedAt(transaction.getUpdatedAt())
                .build();
    }
    
    /**
     * TransactionDto'yu Transaction entity'ye dönüştürür (yeni entity oluşturur)
     *
     * @param transactionDto TransactionDto
     * @return Transaction entity
     */
    public Transaction toEntity(TransactionDto transactionDto) {
        if (transactionDto == null) {
            return null;
        }
        
        Transaction transaction = new Transaction();
        updateEntityFromDto(transactionDto, transaction);
        return transaction;
    }
    
    /**
     * TransactionDto değerlerini mevcut Transaction entity'sine kopyalar (update)
     *
     * @param transactionDto Kaynak TransactionDto
     * @param transaction Hedef Transaction entity
     */
    public void updateEntityFromDto(TransactionDto transactionDto, Transaction transaction) {
        if (transactionDto == null || transaction == null) {
            return;
        }
        
        transaction.setAmount(transactionDto.getAmount());
        transaction.setTransactionDate(transactionDto.getTransactionDate());
        transaction.setType(transactionDto.getType());
        transaction.setDescription(transactionDto.getDescription());
        transaction.setCategory(transactionDto.getCategory());
        transaction.setReceiptUrl(transactionDto.getReceiptUrl());
        transaction.setInvoiceNumber(transactionDto.getInvoiceNumber());
        transaction.setVendorName(transactionDto.getVendorName());
        transaction.setPaymentMethod(transactionDto.getPaymentMethod());
        transaction.setStatus(transactionDto.getStatus());
    }
} 