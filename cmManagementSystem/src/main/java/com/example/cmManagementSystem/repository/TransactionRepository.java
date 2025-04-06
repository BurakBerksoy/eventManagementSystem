package com.example.cmManagementSystem.repository;

import com.example.cmManagementSystem.entity.Transaction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    
    List<Transaction> findByClubId(Long clubId);
    
    List<Transaction> findByEventId(Long eventId);
    
    List<Transaction> findByBudgetId(Long budgetId);
    
    Page<Transaction> findByClubId(Long clubId, Pageable pageable);
    
    Page<Transaction> findByClubIdAndType(Long clubId, Transaction.TransactionType type, Pageable pageable);
    
    Page<Transaction> findByClubIdAndStatus(Long clubId, Transaction.TransactionStatus status, Pageable pageable);
    
    List<Transaction> findByTransactionDateBetween(LocalDateTime startDate, LocalDateTime endDate);
    
    @Query("SELECT SUM(t.amount) FROM Transaction t WHERE t.club.id = ?1 AND t.type = ?2")
    BigDecimal sumAmountByClubIdAndType(Long clubId, Transaction.TransactionType type);
    
    @Query("SELECT SUM(t.amount) FROM Transaction t WHERE t.club.id = ?1 AND t.type = ?2 AND t.transactionDate BETWEEN ?3 AND ?4")
    BigDecimal sumAmountByClubIdAndTypeAndDateRange(Long clubId, Transaction.TransactionType type, LocalDateTime startDate, LocalDateTime endDate);
} 