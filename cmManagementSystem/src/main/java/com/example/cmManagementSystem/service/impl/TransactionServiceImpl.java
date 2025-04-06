package com.example.cmManagementSystem.service.impl;

import com.example.cmManagementSystem.dto.TransactionDto;
import com.example.cmManagementSystem.entity.Budget;
import com.example.cmManagementSystem.entity.Club;
import com.example.cmManagementSystem.entity.Event;
import com.example.cmManagementSystem.entity.Transaction;
import com.example.cmManagementSystem.entity.User;
import com.example.cmManagementSystem.mapper.TransactionMapper;
import com.example.cmManagementSystem.repository.BudgetRepository;
import com.example.cmManagementSystem.repository.ClubRepository;
import com.example.cmManagementSystem.repository.EventRepository;
import com.example.cmManagementSystem.repository.TransactionRepository;
import com.example.cmManagementSystem.repository.UserRepository;
import com.example.cmManagementSystem.service.ClubAuthService;
import com.example.cmManagementSystem.service.TransactionService;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service("transactionService")
public class TransactionServiceImpl implements TransactionService {

    private final TransactionRepository transactionRepository;
    private final ClubRepository clubRepository;
    private final BudgetRepository budgetRepository;
    private final EventRepository eventRepository;
    private final UserRepository userRepository;
    private final TransactionMapper transactionMapper;
    private final ClubAuthService clubAuthService;

    @Autowired
    public TransactionServiceImpl(
            TransactionRepository transactionRepository,
            ClubRepository clubRepository,
            BudgetRepository budgetRepository,
            EventRepository eventRepository,
            UserRepository userRepository,
            TransactionMapper transactionMapper,
            ClubAuthService clubAuthService) {
        this.transactionRepository = transactionRepository;
        this.clubRepository = clubRepository;
        this.budgetRepository = budgetRepository;
        this.eventRepository = eventRepository;
        this.userRepository = userRepository;
        this.transactionMapper = transactionMapper;
        this.clubAuthService = clubAuthService;
    }

    @Override
    public Page<TransactionDto> findAll(Pageable pageable) {
        return transactionRepository.findAll(pageable)
                .map(transactionMapper::toDto);
    }

    @Override
    public TransactionDto findById(Long id) {
        Transaction transaction = transactionRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("İşlem bulunamadı: " + id));
        return transactionMapper.toDto(transaction);
    }

    @Override
    public List<TransactionDto> findByClub(Long clubId) {
        // Kulüp kontrolü
        if (!clubRepository.existsById(clubId)) {
            throw new EntityNotFoundException("Kulüp bulunamadı: " + clubId);
        }

        // Kulübün işlemlerini bul
        return transactionRepository.findByClubId(clubId).stream()
                .map(transactionMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public Page<TransactionDto> findByClubId(Long clubId, Pageable pageable) {
        // Kulüp kontrolü
        if (!clubRepository.existsById(clubId)) {
            throw new EntityNotFoundException("Kulüp bulunamadı: " + clubId);
        }

        // Kulübün işlemlerini bul (sayfalanmış)
        return transactionRepository.findByClubId(clubId, pageable)
                .map(transactionMapper::toDto);
    }

    @Override
    public Page<TransactionDto> findByClubIdAndType(Long clubId, Transaction.TransactionType type, Pageable pageable) {
        // Kulüp kontrolü
        if (!clubRepository.existsById(clubId)) {
            throw new EntityNotFoundException("Kulüp bulunamadı: " + clubId);
        }

        // Kulübün belirli tipteki işlemlerini bul (sayfalanmış)
        return transactionRepository.findByClubIdAndType(clubId, type, pageable)
                .map(transactionMapper::toDto);
    }

    @Override
    public List<TransactionDto> findByEventId(Long eventId) {
        // Etkinlik kontrolü
        if (!eventRepository.existsById(eventId)) {
            throw new EntityNotFoundException("Etkinlik bulunamadı: " + eventId);
        }

        // Etkinliğin işlemlerini bul
        return transactionRepository.findByEventId(eventId).stream()
                .map(transactionMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<TransactionDto> findByBudgetId(Long budgetId) {
        // Bütçe kontrolü
        if (!budgetRepository.existsById(budgetId)) {
            throw new EntityNotFoundException("Bütçe bulunamadı: " + budgetId);
        }

        // Bütçenin işlemlerini bul
        return transactionRepository.findByBudgetId(budgetId).stream()
                .map(transactionMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public TransactionDto createTransaction(TransactionDto transactionDto) {
        // DTO'yu entity'ye dönüştür
        Transaction transaction = transactionMapper.toEntity(transactionDto);

        // Kulüp kontrolü
        Club club = clubRepository.findById(transactionDto.getClubId())
                .orElseThrow(() -> new EntityNotFoundException("Kulüp bulunamadı: " + transactionDto.getClubId()));
        transaction.setClub(club);

        // Bütçe kontrolü (opsiyonel)
        if (transactionDto.getBudgetId() != null) {
            Budget budget = budgetRepository.findById(transactionDto.getBudgetId())
                    .orElseThrow(() -> new EntityNotFoundException("Bütçe bulunamadı: " + transactionDto.getBudgetId()));
            transaction.setBudget(budget);
        }

        // Etkinlik kontrolü (opsiyonel)
        if (transactionDto.getEventId() != null) {
            Event event = eventRepository.findById(transactionDto.getEventId())
                    .orElseThrow(() -> new EntityNotFoundException("Etkinlik bulunamadı: " + transactionDto.getEventId()));
            transaction.setEvent(event);
        }

        // Oluşturan kullanıcı kontrolü
        if (transactionDto.getCreatedById() != null) {
            User createdBy = userRepository.findById(transactionDto.getCreatedById())
                    .orElseThrow(() -> new EntityNotFoundException("Kullanıcı bulunamadı: " + transactionDto.getCreatedById()));
            transaction.setCreatedBy(createdBy);
        }

        // Varsayılan durum
        if (transaction.getStatus() == null) {
            transaction.setStatus(Transaction.TransactionStatus.PENDING);
        }

        // İşlem tarihini ayarla
        if (transaction.getTransactionDate() == null) {
            transaction.setTransactionDate(LocalDateTime.now());
        }

        // Kaydet
        transaction = transactionRepository.save(transaction);
        return transactionMapper.toDto(transaction);
    }

    @Override
    @Transactional
    public TransactionDto addTransaction(Long clubId, TransactionDto transactionDto) {
        // Kulüp ID'sini ayarla
        transactionDto.setClubId(clubId);
        return createTransaction(transactionDto);
    }

    @Override
    @Transactional
    public TransactionDto updateTransaction(Long id, TransactionDto transactionDto) {
        // İşlem kontrolü
        Transaction transaction = transactionRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("İşlem bulunamadı: " + id));

        // DTO'dan entity'yi güncelle
        transactionMapper.updateEntityFromDto(transactionDto, transaction);

        // Kaydet
        transaction = transactionRepository.save(transaction);
        return transactionMapper.toDto(transaction);
    }

    @Override
    @Transactional
    public TransactionDto approveTransaction(Long id, Long approverId) {
        // İşlem kontrolü
        Transaction transaction = transactionRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("İşlem bulunamadı: " + id));

        // Onaylayan kullanıcı kontrolü
        User approver = userRepository.findById(approverId)
                .orElseThrow(() -> new EntityNotFoundException("Kullanıcı bulunamadı: " + approverId));

        // İşlemi onayla
        transaction.setApprovedBy(approver);
        transaction.setApprovalDate(LocalDateTime.now());
        transaction.setStatus(Transaction.TransactionStatus.APPROVED);

        // Kaydet
        transaction = transactionRepository.save(transaction);
        return transactionMapper.toDto(transaction);
    }

    @Override
    @Transactional
    public TransactionDto rejectTransaction(Long id, String reason) {
        // İşlem kontrolü
        Transaction transaction = transactionRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("İşlem bulunamadı: " + id));

        // İşlemi reddet
        transaction.setStatus(Transaction.TransactionStatus.REJECTED);
        transaction.setDescription(transaction.getDescription() + " (Red sebebi: " + reason + ")");

        // Kaydet
        transaction = transactionRepository.save(transaction);
        return transactionMapper.toDto(transaction);
    }

    @Override
    @Transactional
    public void deleteTransaction(Long id) {
        // İşlem kontrolü
        Transaction transaction = transactionRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("İşlem bulunamadı: " + id));

        // Sil
        transactionRepository.delete(transaction);
    }

    @Override
    public BigDecimal calculateTotalByClubIdAndType(Long clubId, Transaction.TransactionType type) {
        // Kulüp kontrolü
        if (!clubRepository.existsById(clubId)) {
            throw new EntityNotFoundException("Kulüp bulunamadı: " + clubId);
        }

        // Toplam tutarı hesapla
        BigDecimal total = transactionRepository.sumAmountByClubIdAndType(clubId, type);
        return total != null ? total : BigDecimal.ZERO;
    }

    @Override
    public BigDecimal calculateTotalByClubIdAndTypeAndDateRange(Long clubId, Transaction.TransactionType type,
                                                              LocalDateTime startDate, LocalDateTime endDate) {
        // Kulüp kontrolü
        if (!clubRepository.existsById(clubId)) {
            throw new EntityNotFoundException("Kulüp bulunamadı: " + clubId);
        }

        // Belirli tarih aralığındaki toplam tutarı hesapla
        BigDecimal total = transactionRepository.sumAmountByClubIdAndTypeAndDateRange(clubId, type, startDate, endDate);
        return total != null ? total : BigDecimal.ZERO;
    }

    @Override
    public boolean isTransactionOfClub(Long userId, Long transactionId) {
        // İşlem kontrolü
        Transaction transaction = transactionRepository.findById(transactionId)
                .orElse(null);

        if (transaction == null || transaction.getClub() == null) {
            return false;
        }

        // Kullanıcının bu kulübün başkanı olup olmadığını kontrol et
        return clubAuthService.isPresidentOfClub(userId, transaction.getClub().getId());
    }
} 