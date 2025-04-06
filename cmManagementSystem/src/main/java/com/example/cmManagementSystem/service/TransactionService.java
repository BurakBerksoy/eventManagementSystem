package com.example.cmManagementSystem.service;

import com.example.cmManagementSystem.dto.TransactionDto;
import com.example.cmManagementSystem.entity.Transaction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public interface TransactionService {
    
    /**
     * Tüm işlemleri sayfalanmış şekilde getirir
     * 
     * @param pageable Sayfalandırma bilgileri
     * @return İşlem sayfası
     */
    Page<TransactionDto> findAll(Pageable pageable);
    
    /**
     * ID'ye göre işlem getirir
     * 
     * @param id İşlem ID
     * @return İşlem
     */
    TransactionDto findById(Long id);
    
    /**
     * Kulübe göre işlemleri listeler
     * 
     * @param clubId Kulüp ID
     * @return İşlem listesi
     */
    List<TransactionDto> findByClub(Long clubId);
    
    /**
     * Kulübe göre işlemleri sayfalanmış şekilde getirir
     * 
     * @param clubId Kulüp ID
     * @param pageable Sayfalandırma bilgileri
     * @return İşlem sayfası
     */
    Page<TransactionDto> findByClubId(Long clubId, Pageable pageable);
    
    /**
     * Kulübe ve işlem tipine göre işlemleri sayfalanmış şekilde getirir
     * 
     * @param clubId Kulüp ID
     * @param type İşlem tipi
     * @param pageable Sayfalandırma bilgileri
     * @return İşlem sayfası
     */
    Page<TransactionDto> findByClubIdAndType(Long clubId, Transaction.TransactionType type, Pageable pageable);
    
    /**
     * Etkinliğe göre işlemleri listeler
     * 
     * @param eventId Etkinlik ID
     * @return İşlem listesi
     */
    List<TransactionDto> findByEventId(Long eventId);
    
    /**
     * Bütçeye göre işlemleri listeler
     * 
     * @param budgetId Bütçe ID
     * @return İşlem listesi
     */
    List<TransactionDto> findByBudgetId(Long budgetId);
    
    /**
     * Yeni işlem oluşturur
     * 
     * @param transactionDto İşlem bilgileri
     * @return Oluşturulan işlem
     */
    TransactionDto createTransaction(TransactionDto transactionDto);
    
    /**
     * Kulüp için yeni işlem ekler
     * 
     * @param clubId Kulüp ID
     * @param transactionDto İşlem bilgileri
     * @return Oluşturulan işlem
     */
    TransactionDto addTransaction(Long clubId, TransactionDto transactionDto);
    
    /**
     * İşlem bilgilerini günceller
     * 
     * @param id İşlem ID
     * @param transactionDto Güncellenecek bilgiler
     * @return Güncellenen işlem
     */
    TransactionDto updateTransaction(Long id, TransactionDto transactionDto);
    
    /**
     * İşlemi onaylar
     * 
     * @param id İşlem ID
     * @param approverId Onaylayan kullanıcı ID
     * @return Onaylanan işlem
     */
    TransactionDto approveTransaction(Long id, Long approverId);
    
    /**
     * İşlemi reddeder
     * 
     * @param id İşlem ID
     * @param reason Ret sebebi
     * @return Reddedilen işlem
     */
    TransactionDto rejectTransaction(Long id, String reason);
    
    /**
     * İşlem siler
     * 
     * @param id Silinecek işlem ID
     */
    void deleteTransaction(Long id);
    
    /**
     * Kulüp için belirli tip işlemlerin toplam tutarını hesaplar
     * 
     * @param clubId Kulüp ID
     * @param type İşlem tipi
     * @return Toplam tutar
     */
    BigDecimal calculateTotalByClubIdAndType(Long clubId, Transaction.TransactionType type);
    
    /**
     * Kulüp için belirli tarih aralığındaki belirli tip işlemlerin toplam tutarını hesaplar
     * 
     * @param clubId Kulüp ID
     * @param type İşlem tipi
     * @param startDate Başlangıç tarihi
     * @param endDate Bitiş tarihi
     * @return Toplam tutar
     */
    BigDecimal calculateTotalByClubIdAndTypeAndDateRange(Long clubId, Transaction.TransactionType type, 
                                                      LocalDateTime startDate, LocalDateTime endDate);
    
    /**
     * İşlemin belirli bir kulübün başkanı tarafından yönetilip yönetilmediğini kontrol eder
     * 
     * @param userId Kullanıcı ID
     * @param transactionId İşlem ID
     * @return Kullanıcı bu işlemi yönetebilir mi
     */
    boolean isTransactionOfClub(Long userId, Long transactionId);
} 