package com.example.cmManagementSystem.service.impl;

import com.example.cmManagementSystem.dto.BudgetDto;
import com.example.cmManagementSystem.entity.Budget;
import com.example.cmManagementSystem.entity.Club;
import com.example.cmManagementSystem.entity.User;
import com.example.cmManagementSystem.mapper.BudgetMapper;
import com.example.cmManagementSystem.repository.BudgetRepository;
import com.example.cmManagementSystem.repository.ClubRepository;
import com.example.cmManagementSystem.repository.UserRepository;
import com.example.cmManagementSystem.service.BudgetService;
import com.example.cmManagementSystem.service.ClubAuthService;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service("budgetService")
public class BudgetServiceImpl implements BudgetService {

    private final BudgetRepository budgetRepository;
    private final ClubRepository clubRepository;
    private final UserRepository userRepository;
    private final BudgetMapper budgetMapper;
    private final ClubAuthService clubAuthService;

    @Autowired
    public BudgetServiceImpl(
            BudgetRepository budgetRepository,
            ClubRepository clubRepository,
            UserRepository userRepository,
            BudgetMapper budgetMapper,
            ClubAuthService clubAuthService) {
        this.budgetRepository = budgetRepository;
        this.clubRepository = clubRepository;
        this.userRepository = userRepository;
        this.budgetMapper = budgetMapper;
        this.clubAuthService = clubAuthService;
    }

    @Override
    public List<BudgetDto> findAll() {
        return budgetRepository.findAll().stream()
                .map(budgetMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public BudgetDto findById(Long id) {
        Budget budget = budgetRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Bütçe bulunamadı: " + id));
        return budgetMapper.toDto(budget);
    }

    @Override
    public BudgetDto findByClub(Long clubId) {
        // Kulüp kontrolü
        if (!clubRepository.existsById(clubId)) {
            throw new EntityNotFoundException("Kulüp bulunamadı: " + clubId);
        }

        // Kulübün aktif bütçesini bul
        List<Budget> budgets = budgetRepository.findByClubIdAndStatus(clubId, Budget.BudgetStatus.ACTIVE);
        if (budgets.isEmpty()) {
            throw new EntityNotFoundException("Kulübe ait aktif bütçe bulunamadı: " + clubId);
        }

        // İlk aktif bütçeyi dön
        return budgetMapper.toDto(budgets.get(0));
    }

    @Override
    public List<BudgetDto> findByClubId(Long clubId) {
        // Kulüp kontrolü
        if (!clubRepository.existsById(clubId)) {
            throw new EntityNotFoundException("Kulüp bulunamadı: " + clubId);
        }

        // Kulübün tüm bütçelerini bul
        return budgetRepository.findByClubId(clubId).stream()
                .map(budgetMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<BudgetDto> findByClubIdAndStatus(Long clubId, Budget.BudgetStatus status) {
        // Kulüp kontrolü
        if (!clubRepository.existsById(clubId)) {
            throw new EntityNotFoundException("Kulüp bulunamadı: " + clubId);
        }

        // Kulübün belirli durumdaki bütçelerini bul
        return budgetRepository.findByClubIdAndStatus(clubId, status).stream()
                .map(budgetMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<BudgetDto> findByAcademicYear(String academicYear) {
        return budgetRepository.findByAcademicYear(academicYear).stream()
                .map(budgetMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public BudgetDto createBudget(BudgetDto budgetDto) {
        // DTO'yu entity'ye dönüştür
        Budget budget = budgetMapper.toEntity(budgetDto);

        // Kulüp kontrolü
        Club club = clubRepository.findById(budgetDto.getClubId())
                .orElseThrow(() -> new EntityNotFoundException("Kulüp bulunamadı: " + budgetDto.getClubId()));
        budget.setClub(club);

        // Oluşturan kullanıcı kontrolü
        if (budgetDto.getCreatedById() != null) {
            User createdBy = userRepository.findById(budgetDto.getCreatedById())
                    .orElseThrow(() -> new EntityNotFoundException("Kullanıcı bulunamadı: " + budgetDto.getCreatedById()));
            budget.setCreatedBy(createdBy);
        }

        // Varsayılan durum
        if (budget.getStatus() == null) {
            budget.setStatus(Budget.BudgetStatus.ACTIVE);
        }

        // Kaydet
        budget = budgetRepository.save(budget);
        return budgetMapper.toDto(budget);
    }

    @Override
    @Transactional
    public BudgetDto createBudget(Long clubId, BudgetDto budgetDto) {
        // Kulüp ID'sini ayarla
        budgetDto.setClubId(clubId);
        return createBudget(budgetDto);
    }

    @Override
    @Transactional
    public BudgetDto updateBudget(Long id, BudgetDto budgetDto) {
        // Bütçe kontrolü
        Budget budget = budgetRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Bütçe bulunamadı: " + id));

        // DTO'dan entity'yi güncelle
        budgetMapper.updateEntityFromDto(budgetDto, budget);

        // Kaydet
        budget = budgetRepository.save(budget);
        return budgetMapper.toDto(budget);
    }

    @Override
    @Transactional
    public BudgetDto updateBudgetStatus(Long id, Budget.BudgetStatus status) {
        // Bütçe kontrolü
        Budget budget = budgetRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Bütçe bulunamadı: " + id));

        // Durumu güncelle
        budget.setStatus(status);
        budget = budgetRepository.save(budget);
        return budgetMapper.toDto(budget);
    }

    @Override
    @Transactional
    public void deleteBudget(Long id) {
        // Bütçe kontrolü
        Budget budget = budgetRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Bütçe bulunamadı: " + id));

        // Sil
        budgetRepository.delete(budget);
    }

    @Override
    public BudgetDto generateReport(Long clubId, String startDate, String endDate) {
        // Kulüp kontrolü
        if (!clubRepository.existsById(clubId)) {
            throw new EntityNotFoundException("Kulüp bulunamadı: " + clubId);
        }

        // Kulübün aktif bütçesini bul
        List<Budget> budgets = budgetRepository.findByClubIdAndStatus(clubId, Budget.BudgetStatus.ACTIVE);
        if (budgets.isEmpty()) {
            throw new EntityNotFoundException("Kulübe ait aktif bütçe bulunamadı: " + clubId);
        }

        // Tarih aralığı belirleme
        LocalDateTime start = startDate != null
                ? LocalDateTime.parse(startDate, DateTimeFormatter.ISO_DATE_TIME)
                : LocalDateTime.now().minusMonths(1);

        LocalDateTime end = endDate != null
                ? LocalDateTime.parse(endDate, DateTimeFormatter.ISO_DATE_TIME)
                : LocalDateTime.now();

        // İlk aktif bütçeyi dön (gerçek hayatta bu kısım bütçe işlemlerini tarih aralığına göre filtreleyebilir)
        return budgetMapper.toDto(budgets.get(0));
    }

    @Override
    public boolean isBudgetOfClub(Long userId, Long budgetId) {
        // Bütçe kontrolü
        Budget budget = budgetRepository.findById(budgetId)
                .orElse(null);

        if (budget == null || budget.getClub() == null) {
            return false;
        }

        // Kullanıcının bu kulübün başkanı olup olmadığını kontrol et
        return clubAuthService.isPresidentOfClub(userId, budget.getClub().getId());
    }
} 