package com.example.cmManagementSystem.controller;

import com.example.cmManagementSystem.dto.ReportDto;
import com.example.cmManagementSystem.service.ReportService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/reports")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class ReportController {
    
    private final ReportService reportService;
    
    @Autowired
    public ReportController(ReportService reportService) {
        this.reportService = reportService;
    }
    
    // Tüm raporları getir (sadece ADMIN)
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<ReportDto>> getAllReports() {
        return ResponseEntity.ok(reportService.findAll());
    }
    
    // ID'ye göre rapor getir
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or (hasRole('CLUB_PRESIDENT') and @reportService.isReportAccessibleByUser(authentication.principal, #id))")
    public ResponseEntity<ReportDto> getReportById(@PathVariable Long id) {
        return ResponseEntity.ok(reportService.findById(id));
    }
    
    // Kullanıcıya göre raporları getir
    @GetMapping("/user/{userId}")
    @PreAuthorize("hasRole('ADMIN') or #userId == authentication.principal.id")
    public ResponseEntity<List<ReportDto>> getReportsByUser(@PathVariable Long userId) {
        return ResponseEntity.ok(reportService.findByUser(userId));
    }
    
    // Kulübe göre raporları getir
    @GetMapping("/club/{clubId}")
    @PreAuthorize("hasRole('ADMIN') or (hasRole('CLUB_PRESIDENT') and @clubAuthService.isPresidentOfClub(authentication.principal, #clubId))")
    public ResponseEntity<List<ReportDto>> getReportsByClub(@PathVariable Long clubId) {
        return ResponseEntity.ok(reportService.findByClub(clubId));
    }
    
    // Etkinliğe göre raporları getir
    @GetMapping("/event/{eventId}")
    @PreAuthorize("hasRole('ADMIN') or (hasRole('CLUB_PRESIDENT') and @eventAuthService.isEventCreatedByUser(authentication.principal, #eventId))")
    public ResponseEntity<List<ReportDto>> getReportsByEvent(@PathVariable Long eventId) {
        return ResponseEntity.ok(reportService.findByEvent(eventId));
    }
    
    // Yeni rapor oluştur (ADMIN veya CLUB_PRESIDENT)
    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('CLUB_PRESIDENT')")
    public ResponseEntity<ReportDto> createReport(@Valid @RequestBody ReportDto reportDto) {
        return new ResponseEntity<>(reportService.createReport(reportDto), HttpStatus.CREATED);
    }
    
    // Kulüp raporu oluştur
    @PostMapping("/club/{clubId}")
    @PreAuthorize("hasRole('ADMIN') or (hasRole('CLUB_PRESIDENT') and @clubAuthService.isPresidentOfClub(authentication.principal, #clubId))")
    public ResponseEntity<ReportDto> generateClubReport(
            @PathVariable Long clubId,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate,
            @RequestParam(required = false) String type) {
        return new ResponseEntity<>(reportService.generateClubReport(clubId, startDate, endDate, type), HttpStatus.CREATED);
    }
    
    // Etkinlik raporu oluştur
    @PostMapping("/event/{eventId}")
    @PreAuthorize("hasRole('ADMIN') or (hasRole('CLUB_PRESIDENT') and @eventAuthService.isEventCreatedByUser(authentication.principal, #eventId))")
    public ResponseEntity<ReportDto> generateEventReport(
            @PathVariable Long eventId,
            @RequestParam(required = false) String type) {
        return new ResponseEntity<>(reportService.generateEventReport(eventId, type), HttpStatus.CREATED);
    }
    
    // Raporu güncelle (ADMIN veya rapor sahibi)
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or @reportService.isReportCreatedByUser(authentication.principal, #id)")
    public ResponseEntity<ReportDto> updateReport(
            @PathVariable Long id,
            @Valid @RequestBody ReportDto reportDto) {
        return ResponseEntity.ok(reportService.updateReport(id, reportDto));
    }
    
    // Raporu sil (ADMIN veya rapor sahibi)
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or @reportService.isReportCreatedByUser(authentication.principal, #id)")
    public ResponseEntity<Void> deleteReport(@PathVariable Long id) {
        reportService.deleteReport(id);
        return ResponseEntity.noContent().build();
    }
    
    // Rapor dashboardu için özet istatistikler (ADMIN)
    @GetMapping("/dashboard")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getDashboardStats() {
        return ResponseEntity.ok(reportService.getDashboardStats());
    }
    
    // Raporu PDF olarak dışa aktar
    @GetMapping("/{id}/export/pdf")
    @PreAuthorize("hasRole('ADMIN') or (hasRole('CLUB_PRESIDENT') and @reportService.isReportAccessibleByUser(authentication.principal, #id))")
    public ResponseEntity<?> exportReportAsPdf(@PathVariable Long id) {
        return reportService.exportReportAsPdf(id);
    }
    
    // Raporu Excel olarak dışa aktar
    @GetMapping("/{id}/export/excel")
    @PreAuthorize("hasRole('ADMIN') or (hasRole('CLUB_PRESIDENT') and @reportService.isReportAccessibleByUser(authentication.principal, #id))")
    public ResponseEntity<?> exportReportAsExcel(@PathVariable Long id) {
        return reportService.exportReportAsExcel(id);
    }
} 