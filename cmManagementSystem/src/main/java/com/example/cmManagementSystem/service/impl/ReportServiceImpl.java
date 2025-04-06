package com.example.cmManagementSystem.service.impl;

import com.example.cmManagementSystem.dto.ReportDto;
import com.example.cmManagementSystem.entity.Club;
import com.example.cmManagementSystem.entity.ClubMembership;
import com.example.cmManagementSystem.entity.Event;
import com.example.cmManagementSystem.entity.Report;
import com.example.cmManagementSystem.entity.User;
import com.example.cmManagementSystem.exception.ResourceNotFoundException;
import com.example.cmManagementSystem.repository.ClubMembershipRepository;
import com.example.cmManagementSystem.repository.ClubRepository;
import com.example.cmManagementSystem.repository.EventRepository;
import com.example.cmManagementSystem.repository.ReportRepository;
import com.example.cmManagementSystem.repository.UserRepository;
import com.example.cmManagementSystem.service.ReportService;
import lombok.extern.slf4j.Slf4j;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@Slf4j
@Transactional
public class ReportServiceImpl implements ReportService {
    
    private final ReportRepository reportRepository;
    private final UserRepository userRepository;
    private final ClubRepository clubRepository;
    private final EventRepository eventRepository;
    private final ClubMembershipRepository clubMembershipRepository;
    private final ModelMapper modelMapper;
    
    @Autowired
    public ReportServiceImpl(
            ReportRepository reportRepository,
            UserRepository userRepository,
            ClubRepository clubRepository,
            EventRepository eventRepository,
            ClubMembershipRepository clubMembershipRepository,
            ModelMapper modelMapper) {
        this.reportRepository = reportRepository;
        this.userRepository = userRepository;
        this.clubRepository = clubRepository;
        this.eventRepository = eventRepository;
        this.clubMembershipRepository = clubMembershipRepository;
        this.modelMapper = modelMapper;
    }
    
    @Override
    public List<ReportDto> findAll() {
        List<Report> reports = reportRepository.findAll();
        return reports.stream()
                .map(this::mapToReportDto)
                .collect(Collectors.toList());
    }
    
    @Override
    public ReportDto findById(Long id) {
        Report report = reportRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Report", "id", id));
        return mapToReportDto(report);
    }
    
    @Override
    public List<ReportDto> findByUser(Long userId) {
        List<Report> reports = reportRepository.findByCreatedById(userId);
        return reports.stream()
                .map(this::mapToReportDto)
                .collect(Collectors.toList());
    }
    
    @Override
    public List<ReportDto> findByClub(Long clubId) {
        List<Report> reports = reportRepository.findByClubId(clubId);
        return reports.stream()
                .map(this::mapToReportDto)
                .collect(Collectors.toList());
    }
    
    @Override
    public List<ReportDto> findByEvent(Long eventId) {
        List<Report> reports = reportRepository.findByEventId(eventId);
        return reports.stream()
                .map(this::mapToReportDto)
                .collect(Collectors.toList());
    }
    
    @Override
    @Transactional
    public ReportDto createReport(ReportDto reportDto) {
        Report report = new Report();
        
        // Temel bilgileri ayarla
        report.setTitle(reportDto.getTitle());
        report.setDescription(reportDto.getDescription());
        report.setReportData(reportDto.getReportData());
        report.setType(reportDto.getType());
        report.setReportParameters(reportDto.getReportParameters());
        report.setStartDate(reportDto.getStartDate());
        report.setEndDate(reportDto.getEndDate());
        report.setFileUrl(reportDto.getFileUrl());
        report.setIsPublic(reportDto.getIsPublic());
        report.setIsScheduled(reportDto.getIsScheduled());
        report.setScheduleInterval(reportDto.getScheduleInterval());
        report.setLastRunDate(reportDto.getLastRunDate());
        report.setNextRunDate(reportDto.getNextRunDate());
        
        // Kullanıcıyı ayarla
        User createdBy = userRepository.findById(reportDto.getCreatedById())
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", reportDto.getCreatedById()));
        report.setCreatedBy(createdBy);
        
        // Kulüp ilişkisini ayarla (varsa)
        if (reportDto.getClubId() != null) {
            Club club = clubRepository.findById(reportDto.getClubId())
                    .orElseThrow(() -> new ResourceNotFoundException("Club", "id", reportDto.getClubId()));
            report.setClub(club);
        }
        
        // Etkinlik ilişkisini ayarla (varsa)
        if (reportDto.getEventId() != null) {
            Event event = eventRepository.findById(reportDto.getEventId())
                    .orElseThrow(() -> new ResourceNotFoundException("Event", "id", reportDto.getEventId()));
            report.setEvent(event);
        }
        
        // Raporu kaydet
        Report savedReport = reportRepository.save(report);
        
        return mapToReportDto(savedReport);
    }
    
    @Override
    @Transactional
    public ReportDto generateClubReport(Long clubId, String startDateStr, String endDateStr, String type) {
        // Kulübü bul
        Club club = clubRepository.findById(clubId)
                .orElseThrow(() -> new ResourceNotFoundException("Club", "id", clubId));
        
        // Rapor tipi
        Report.ReportType reportType = Report.ReportType.CLUB_ACTIVITY;
        if (type != null && !type.isEmpty()) {
            try {
                reportType = Report.ReportType.valueOf(type.toUpperCase());
            } catch (IllegalArgumentException e) {
                log.warn("Invalid report type: {}, using default", type);
            }
        }
        
        // Tarih aralığı
        LocalDateTime startDate = null;
        LocalDateTime endDate = null;
        DateTimeFormatter formatter = DateTimeFormatter.ISO_DATE_TIME;
        
        if (startDateStr != null && !startDateStr.isEmpty()) {
            startDate = LocalDateTime.parse(startDateStr, formatter);
        } else {
            startDate = LocalDateTime.now().minusMonths(1);
        }
        
        if (endDateStr != null && !endDateStr.isEmpty()) {
            endDate = LocalDateTime.parse(endDateStr, formatter);
        } else {
            endDate = LocalDateTime.now();
        }
        
        // Rapor içeriği
        String reportData = generateClubReportData(club, reportType, startDate, endDate);
        
        // Rapor oluştur
        Report report = new Report();
        report.setTitle(club.getName() + " - " + reportType.name() + " Raporu");
        report.setDescription("Kulüp faaliyetleri ve verilerini içeren otomatik oluşturulmuş rapor");
        report.setReportData(reportData);
        report.setType(reportType);
        report.setStartDate(startDate);
        report.setEndDate(endDate);
        report.setClub(club);
        report.setReportParameters("clubId=" + clubId + 
                                  ";startDate=" + startDate + 
                                  ";endDate=" + endDate + 
                                  ";type=" + reportType);
        report.setIsPublic(false);
        report.setCreatedBy(club.getCreatedBy());
        
        // Raporu kaydet
        Report savedReport = reportRepository.save(report);
        
        return mapToReportDto(savedReport);
    }
    
    @Override
    @Transactional
    public ReportDto generateEventReport(Long eventId, String type) {
        // Etkinliği bul
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new ResourceNotFoundException("Event", "id", eventId));
        
        // Rapor tipi
        Report.ReportType reportType = Report.ReportType.EVENT_PARTICIPATION;
        if (type != null && !type.isEmpty()) {
            try {
                reportType = Report.ReportType.valueOf(type.toUpperCase());
            } catch (IllegalArgumentException e) {
                log.warn("Invalid report type: {}, using default", type);
            }
        }
        
        // Rapor içeriği
        String reportData = generateEventReportData(event, reportType);
        
        // Rapor oluştur
        Report report = new Report();
        report.setTitle(event.getTitle() + " - " + reportType.name() + " Raporu");
        report.setDescription("Etkinlik verileri ve katılım bilgilerini içeren otomatik oluşturulmuş rapor");
        report.setReportData(reportData);
        report.setType(reportType);
        report.setStartDate(event.getStartDate());
        report.setEndDate(event.getEndDate());
        report.setEvent(event);
        report.setReportParameters("eventId=" + eventId + ";type=" + reportType);
        report.setIsPublic(false);
        report.setCreatedBy(event.getCreatedBy());
        
        if (event.getClub() != null) {
            report.setClub(event.getClub());
        }
        
        // Raporu kaydet
        Report savedReport = reportRepository.save(report);
        
        return mapToReportDto(savedReport);
    }
    
    @Override
    @Transactional
    public ReportDto updateReport(Long id, ReportDto reportDto) {
        // Raporu bul
        Report report = reportRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Report", "id", id));
        
        // Temel bilgileri güncelle
        report.setTitle(reportDto.getTitle());
        report.setDescription(reportDto.getDescription());
        report.setReportData(reportDto.getReportData());
        report.setType(reportDto.getType());
        report.setReportParameters(reportDto.getReportParameters());
        report.setStartDate(reportDto.getStartDate());
        report.setEndDate(reportDto.getEndDate());
        report.setFileUrl(reportDto.getFileUrl());
        report.setIsPublic(reportDto.getIsPublic());
        report.setIsScheduled(reportDto.getIsScheduled());
        report.setScheduleInterval(reportDto.getScheduleInterval());
        report.setNextRunDate(reportDto.getNextRunDate());
        
        // İlişkileri güncelle
        if (reportDto.getClubId() != null) {
            Club club = clubRepository.findById(reportDto.getClubId())
                    .orElseThrow(() -> new ResourceNotFoundException("Club", "id", reportDto.getClubId()));
            report.setClub(club);
        } else {
            report.setClub(null);
        }
        
        if (reportDto.getEventId() != null) {
            Event event = eventRepository.findById(reportDto.getEventId())
                    .orElseThrow(() -> new ResourceNotFoundException("Event", "id", reportDto.getEventId()));
            report.setEvent(event);
        } else {
            report.setEvent(null);
        }
        
        // Raporu kaydet
        Report updatedReport = reportRepository.save(report);
        
        return mapToReportDto(updatedReport);
    }
    
    @Override
    @Transactional
    public void deleteReport(Long id) {
        // Raporu bul
        Report report = reportRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Report", "id", id));
        
        // Raporu sil
        reportRepository.delete(report);
    }
    
    @Override
    public Map<String, Object> getDashboardStats() {
        Map<String, Object> stats = new HashMap<>();
        
        // Toplam rapor sayısı
        stats.put("totalReports", reportRepository.count());
        
        // Rapor tiplerine göre dağılım
        Map<Report.ReportType, Long> typeDistribution = new HashMap<>();
        for (Report.ReportType type : Report.ReportType.values()) {
            long count = reportRepository.findByType(type).size();
            typeDistribution.put(type, count);
        }
        stats.put("reportTypeDistribution", typeDistribution);
        
        // Son 7 günde oluşturulan raporlar
        LocalDateTime lastWeek = LocalDateTime.now().minusDays(7);
        List<Report> recentReports = reportRepository.findAll().stream()
                .filter(r -> r.getCreatedAt().isAfter(lastWeek))
                .collect(Collectors.toList());
        stats.put("recentReportsCount", recentReports.size());
        
        // Planlanmış raporlar
        List<Report> scheduledReports = reportRepository.findByIsScheduled(true);
        stats.put("scheduledReportsCount", scheduledReports.size());
        
        return stats;
    }
    
    @Override
    public ResponseEntity<?> exportReportAsPdf(Long id) {
        // Raporu bul
        Report report = reportRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Report", "id", id));
        
        // PDF dosyası oluşturma işlemi burada yer alacak
        // Örnek olarak dosya yerine sadece metin dönüyoruz
        String pdfContent = "PDF içeriği: " + report.getTitle() + "\n\n" + report.getReportData();
        
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        String filename = report.getTitle().replaceAll("\\s+", "_") + ".pdf";
        headers.setContentDispositionFormData("attachment", filename);
        
        // Gerçek uygulamada PDF belgesinin byte dizisi (byte[]) oluşturulur
        // Örnek: return ResponseEntity.ok().headers(headers).body(pdfBytes);
        
        return ResponseEntity.ok()
                .headers(headers)
                .body(pdfContent.getBytes());
    }
    
    @Override
    public ResponseEntity<?> exportReportAsExcel(Long id) {
        // Raporu bul
        Report report = reportRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Report", "id", id));
        
        // Excel dosyası oluşturma işlemi burada yer alacak
        // Örnek olarak dosya yerine sadece metin dönüyoruz
        String excelContent = "Excel içeriği: " + report.getTitle() + "\n\n" + report.getReportData();
        
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType("application/vnd.ms-excel"));
        String filename = report.getTitle().replaceAll("\\s+", "_") + ".xlsx";
        headers.setContentDispositionFormData("attachment", filename);
        
        // Gerçek uygulamada Excel belgesinin byte dizisi (byte[]) oluşturulur
        // Örnek: return ResponseEntity.ok().headers(headers).body(excelBytes);
        
        return ResponseEntity.ok()
                .headers(headers)
                .body(excelContent.getBytes());
    }
    
    @Override
    public boolean isReportCreatedByUser(Long userId, Long reportId) {
        Report report = reportRepository.findById(reportId)
                .orElseThrow(() -> new ResourceNotFoundException("Report", "id", reportId));
        
        return report.getCreatedBy().getId().equals(userId);
    }
    
    @Override
    public boolean isReportAccessibleByUser(Long userId, Long reportId) {
        Report report = reportRepository.findById(reportId)
                .orElseThrow(() -> new ResourceNotFoundException("Report", "id", reportId));
        
        // Rapor herkese açıksa
        if (Boolean.TRUE.equals(report.getIsPublic())) {
            return true;
        }
        
        // Kullanıcı raporu oluşturan kişiyse
        if (report.getCreatedBy().getId().equals(userId)) {
            return true;
        }
        
        // Rapor bir kulübe aitse ve kullanıcı kulüp başkanıysa
        if (report.getClub() != null) {
            List<ClubMembership> memberships = clubMembershipRepository.findByUserIdAndClubId(userId, report.getClub().getId())
                    .stream()
                    .filter(m -> m.getRole() == ClubMembership.Role.PRESIDENT && m.getIsActive())
                    .collect(Collectors.toList());
            
            if (!memberships.isEmpty()) {
                return true;
            }
        }
        
        return false;
    }
    
    // Entity'den DTO'ya dönüşüm
    private ReportDto mapToReportDto(Report report) {
        ReportDto dto = modelMapper.map(report, ReportDto.class);
        
        // İlişkili entity'lerin bilgilerini ayarla
        if (report.getClub() != null) {
            dto.setClubId(report.getClub().getId());
            dto.setClubName(report.getClub().getName());
        }
        
        if (report.getEvent() != null) {
            dto.setEventId(report.getEvent().getId());
            dto.setEventTitle(report.getEvent().getTitle());
        }
        
        if (report.getCreatedBy() != null) {
            dto.setCreatedById(report.getCreatedBy().getId());
            dto.setCreatedByName(report.getCreatedBy().getFullName());
        }
        
        return dto;
    }
    
    // Kulüp raporu için örnek veri oluşturma
    private String generateClubReportData(Club club, Report.ReportType reportType, LocalDateTime startDate, LocalDateTime endDate) {
        StringBuilder data = new StringBuilder();
        data.append("# ").append(club.getName()).append(" - ").append(reportType.name()).append(" Raporu\n\n");
        data.append("Rapor Dönemi: ").append(startDate).append(" - ").append(endDate).append("\n\n");
        
        switch (reportType) {
            case CLUB_MEMBERSHIP:
                data.append("## Üyelik İstatistikleri\n\n");
                data.append("Toplam Üye Sayısı: ").append(club.getMembers().size()).append("\n");
                data.append("Aktif Üye Sayısı: ").append(club.getMembers().stream()
                        .filter(m -> m.getIsActive())
                        .count()).append("\n");
                data.append("Dönem İçinde Katılan Yeni Üye Sayısı: ").append(club.getMembers().stream()
                        .filter(m -> m.getJoinDate().isAfter(startDate) && m.getJoinDate().isBefore(endDate))
                        .count()).append("\n");
                break;
                
            case CLUB_ACTIVITY:
                data.append("## Etkinlik İstatistikleri\n\n");
                data.append("Toplam Etkinlik Sayısı: ").append(club.getEvents().size()).append("\n");
                data.append("Dönem İçinde Düzenlenen Etkinlik Sayısı: ").append(club.getEvents().stream()
                        .filter(e -> e.getStartDate().isAfter(startDate) && e.getStartDate().isBefore(endDate))
                        .count()).append("\n");
                data.append("Ortalama Katılımcı Sayısı: ").append("--").append("\n");
                break;
                
            case FINANCIAL:
                data.append("## Finansal Rapor\n\n");
                data.append("Toplam Bütçe: ").append(club.getBudget()).append("\n");
                data.append("Harcamalar: ").append("--").append("\n");
                data.append("Gelirler: ").append("--").append("\n");
                data.append("Kalan Bütçe: ").append("--").append("\n");
                break;
                
            default:
                data.append("## Genel Rapor\n\n");
                data.append("Kulüp Adı: ").append(club.getName()).append("\n");
                data.append("Kulüp Başkanı: ").append("--").append("\n");
                data.append("Kuruluş Tarihi: ").append(club.getFoundedAt()).append("\n");
                data.append("Üye Sayısı: ").append(club.getMembers().size()).append("\n");
                data.append("Etkinlik Sayısı: ").append(club.getEvents().size()).append("\n");
        }
        
        data.append("\n\n---\n");
        data.append("Bu rapor otomatik olarak oluşturulmuştur.");
        
        return data.toString();
    }
    
    // Etkinlik raporu için örnek veri oluşturma
    private String generateEventReportData(Event event, Report.ReportType reportType) {
        StringBuilder data = new StringBuilder();
        data.append("# ").append(event.getTitle()).append(" - ").append(reportType.name()).append(" Raporu\n\n");
        data.append("Etkinlik Tarihi: ").append(event.getStartDate()).append(" - ").append(event.getEndDate()).append("\n\n");
        
        switch (reportType) {
            case EVENT_PARTICIPATION:
                data.append("## Katılım İstatistikleri\n\n");
                data.append("Toplam Kayıt Sayısı: ").append(event.getParticipations().size()).append("\n");
                data.append("Katılım Oranı: ").append("--").append("\n");
                data.append("Maksimum Katılımcı Sayısı: ").append(event.getMaxParticipants()).append("\n");
                break;
                
            case FEEDBACK:
                data.append("## Geri Bildirim Analizi\n\n");
                data.append("Alınan Geri Bildirim Sayısı: ").append("--").append("\n");
                data.append("Ortalama Puanlama: ").append("--").append("\n");
                data.append("Öne Çıkan Yorumlar: ").append("--").append("\n");
                break;
                
            case FINANCIAL:
                data.append("## Finansal Rapor\n\n");
                data.append("Toplam Bütçe: ").append(event.getBudget()).append("\n");
                data.append("Harcamalar: ").append("--").append("\n");
                data.append("Gelirler: ").append("--").append("\n");
                data.append("Kalan Bütçe: ").append("--").append("\n");
                break;
                
            default:
                data.append("## Genel Rapor\n\n");
                data.append("Etkinlik Adı: ").append(event.getTitle()).append("\n");
                data.append("Düzenleyen Kulüp: ").append(event.getClub() != null ? event.getClub().getName() : "--").append("\n");
                data.append("Etkinlik Türü: ").append(event.getType()).append("\n");
                data.append("Etkinlik Yeri: ").append(event.getLocation()).append("\n");
                data.append("Katılımcı Sayısı: ").append(event.getParticipations().size()).append("\n");
        }
        
        data.append("\n\n---\n");
        data.append("Bu rapor otomatik olarak oluşturulmuştur.");
        
        return data.toString();
    }
} 