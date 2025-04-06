package com.example.cmManagementSystem.controller;

import com.example.cmManagementSystem.dto.BudgetDto;
import com.example.cmManagementSystem.dto.TransactionDto;
import com.example.cmManagementSystem.service.BudgetService;
import com.example.cmManagementSystem.service.TransactionService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/budgets")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class BudgetController {
    
    private final BudgetService budgetService;
    private final TransactionService transactionService;
    
    @Autowired
    public BudgetController(@Qualifier("budgetService") BudgetService budgetService, 
                           @Qualifier("transactionService") TransactionService transactionService) {
        this.budgetService = budgetService;
        this.transactionService = transactionService;
    }
    
    // Kulübe ait bütçe bilgilerini getir
    @GetMapping("/club/{clubId}")
    public ResponseEntity<BudgetDto> getClubBudget(@PathVariable Long clubId) {
        return ResponseEntity.ok(budgetService.findByClub(clubId));
    }
    
    // Kulübe ait bütçe oluştur (ADMIN veya CLUB_PRESIDENT)
    @PostMapping("/club/{clubId}")
    @PreAuthorize("hasRole('ADMIN') or (hasRole('CLUB_PRESIDENT') and @clubAuthService.isPresidentOfClub(authentication.principal, #clubId))")
    public ResponseEntity<BudgetDto> createBudget(
            @PathVariable Long clubId,
            @Valid @RequestBody BudgetDto budgetDto) {
        return new ResponseEntity<>(budgetService.createBudget(clubId, budgetDto), HttpStatus.CREATED);
    }
    
    // Bütçe güncelle (ADMIN veya CLUB_PRESIDENT)
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or (hasRole('CLUB_PRESIDENT') and @budgetService.isBudgetOfClub(authentication.principal, #id))")
    public ResponseEntity<BudgetDto> updateBudget(@PathVariable Long id, @Valid @RequestBody BudgetDto budgetDto) {
        return ResponseEntity.ok(budgetService.updateBudget(id, budgetDto));
    }
    
    // Kulübe ait finansal işlemleri getir
    @GetMapping("/club/{clubId}/transactions")
    public ResponseEntity<List<TransactionDto>> getClubTransactions(@PathVariable Long clubId) {
        return ResponseEntity.ok(transactionService.findByClub(clubId));
    }
    
    // Finansal işlem getir (ID'ye göre)
    @GetMapping("/transactions/{id}")
    public ResponseEntity<TransactionDto> getTransactionById(@PathVariable Long id) {
        return ResponseEntity.ok(transactionService.findById(id));
    }
    
    // Yeni finansal işlem ekle (ADMIN veya CLUB_PRESIDENT)
    @PostMapping("/club/{clubId}/transactions")
    @PreAuthorize("hasRole('ADMIN') or (hasRole('CLUB_PRESIDENT') and @clubAuthService.isPresidentOfClub(authentication.principal, #clubId))")
    public ResponseEntity<TransactionDto> addTransaction(
            @PathVariable Long clubId,
            @Valid @RequestBody TransactionDto transactionDto) {
        return new ResponseEntity<>(transactionService.addTransaction(clubId, transactionDto), HttpStatus.CREATED);
    }
    
    // Finansal işlem güncelle (ADMIN veya CLUB_PRESIDENT)
    @PutMapping("/transactions/{id}")
    @PreAuthorize("hasRole('ADMIN') or (hasRole('CLUB_PRESIDENT') and @transactionService.isTransactionOfClub(authentication.principal, #id))")
    public ResponseEntity<TransactionDto> updateTransaction(@PathVariable Long id, @Valid @RequestBody TransactionDto transactionDto) {
        return ResponseEntity.ok(transactionService.updateTransaction(id, transactionDto));
    }
    
    // Finansal işlem sil (ADMIN veya CLUB_PRESIDENT)
    @DeleteMapping("/transactions/{id}")
    @PreAuthorize("hasRole('ADMIN') or (hasRole('CLUB_PRESIDENT') and @transactionService.isTransactionOfClub(authentication.principal, #id))")
    public ResponseEntity<Void> deleteTransaction(@PathVariable Long id) {
        transactionService.deleteTransaction(id);
        return ResponseEntity.noContent().build();
    }
    
    // Finansal rapor oluştur (ADMIN veya CLUB_PRESIDENT)
    @GetMapping("/club/{clubId}/report")
    @PreAuthorize("hasRole('ADMIN') or (hasRole('CLUB_PRESIDENT') and @clubAuthService.isPresidentOfClub(authentication.principal, #clubId))")
    public ResponseEntity<BudgetDto> generateBudgetReport(
            @PathVariable Long clubId,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) {
        return ResponseEntity.ok(budgetService.generateReport(clubId, startDate, endDate));
    }
} 