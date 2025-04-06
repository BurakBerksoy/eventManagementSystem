package com.example.cmManagementSystem.service;

import com.example.cmManagementSystem.dto.ReportDto;
import org.springframework.http.ResponseEntity;

import java.util.List;
import java.util.Map;

/**
 * Raporlama işlemlerini yöneten servis
 */
public interface ReportService {
    
    /**
     * Tüm raporları getirir
     */
    List<ReportDto> findAll();
    
    /**
     * ID'ye göre rapor getirir
     */
    ReportDto findById(Long id);
    
    /**
     * Kullanıcıya göre raporları getirir
     */
    List<ReportDto> findByUser(Long userId);
    
    /**
     * Kulübe göre raporları getirir
     */
    List<ReportDto> findByClub(Long clubId);
    
    /**
     * Etkinliğe göre raporları getirir
     */
    List<ReportDto> findByEvent(Long eventId);
    
    /**
     * Yeni rapor oluşturur
     */
    ReportDto createReport(ReportDto reportDto);
    
    /**
     * Kulüp için rapor oluşturur
     */
    ReportDto generateClubReport(Long clubId, String startDate, String endDate, String type);
    
    /**
     * Etkinlik için rapor oluşturur
     */
    ReportDto generateEventReport(Long eventId, String type);
    
    /**
     * Raporu günceller
     */
    ReportDto updateReport(Long id, ReportDto reportDto);
    
    /**
     * Raporu siler
     */
    void deleteReport(Long id);
    
    /**
     * Dashboard istatistiklerini getirir
     */
    Map<String, Object> getDashboardStats();
    
    /**
     * Raporu PDF olarak dışa aktarır
     */
    ResponseEntity<?> exportReportAsPdf(Long id);
    
    /**
     * Raporu Excel olarak dışa aktarır
     */
    ResponseEntity<?> exportReportAsExcel(Long id);
    
    /**
     * Rapor belirli bir kullanıcı tarafından oluşturulmuş mu kontrol eder
     */
    boolean isReportCreatedByUser(Long userId, Long reportId);
    
    /**
     * Kullanıcının rapora erişimi var mı kontrol eder
     */
    boolean isReportAccessibleByUser(Long userId, Long reportId);
} 