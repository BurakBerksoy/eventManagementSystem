package com.example.cmManagementSystem.service;

import com.example.cmManagementSystem.dto.BudgetDto;
import com.example.cmManagementSystem.entity.Budget;

import java.util.List;

public interface BudgetService {
    
    /**
     * Tüm bütçeleri listeler
     * 
     * @return Bütçe listesi
     */
    List<BudgetDto> findAll();
    
    /**
     * ID'ye göre bütçe getirir
     * 
     * @param id Bütçe ID
     * @return Bütçe
     */
    BudgetDto findById(Long id);
    
    /**
     * Kulübe göre bütçe getirir
     * 
     * @param clubId Kulüp ID
     * @return Kulübe ait bütçe
     */
    BudgetDto findByClub(Long clubId);
    
    /**
     * Kulübe göre bütçeleri listeler
     * 
     * @param clubId Kulüp ID
     * @return Bütçe listesi
     */
    List<BudgetDto> findByClubId(Long clubId);
    
    /**
     * Kulübe ve duruma göre bütçeleri listeler
     * 
     * @param clubId Kulüp ID
     * @param status Bütçe durumu
     * @return Bütçe listesi
     */
    List<BudgetDto> findByClubIdAndStatus(Long clubId, Budget.BudgetStatus status);
    
    /**
     * Akademik yıla göre bütçeleri listeler
     * 
     * @param academicYear Akademik yıl
     * @return Bütçe listesi
     */
    List<BudgetDto> findByAcademicYear(String academicYear);
    
    /**
     * Yeni bütçe oluşturur
     * 
     * @param budgetDto Bütçe bilgileri
     * @return Oluşturulan bütçe
     */
    BudgetDto createBudget(BudgetDto budgetDto);
    
    /**
     * Kulüp için yeni bütçe oluşturur
     * 
     * @param clubId Kulüp ID
     * @param budgetDto Bütçe bilgileri
     * @return Oluşturulan bütçe
     */
    BudgetDto createBudget(Long clubId, BudgetDto budgetDto);
    
    /**
     * Bütçe bilgilerini günceller
     * 
     * @param id Bütçe ID
     * @param budgetDto Güncellenecek bilgiler
     * @return Güncellenen bütçe
     */
    BudgetDto updateBudget(Long id, BudgetDto budgetDto);
    
    /**
     * Bütçe durumunu günceller
     * 
     * @param id Bütçe ID
     * @param status Yeni durum
     * @return Güncellenen bütçe
     */
    BudgetDto updateBudgetStatus(Long id, Budget.BudgetStatus status);
    
    /**
     * Bütçe siler
     * 
     * @param id Silinecek bütçe ID'si
     */
    void deleteBudget(Long id);
    
    /**
     * Belirli bir tarih aralığındaki bütçe raporu oluşturur
     * 
     * @param clubId Kulüp ID
     * @param startDate Başlangıç tarihi (ISO formatında String)
     * @param endDate Bitiş tarihi (ISO formatında String)
     * @return Bütçe raporu
     */
    BudgetDto generateReport(Long clubId, String startDate, String endDate);
    
    /**
     * Bütçenin belirli bir kulübün başkanı tarafından yönetilip yönetilmediğini kontrol eder
     * 
     * @param userId Kullanıcı ID
     * @param budgetId Bütçe ID
     * @return Kullanıcı bu bütçeyi yönetebilir mi
     */
    boolean isBudgetOfClub(Long userId, Long budgetId);
} 