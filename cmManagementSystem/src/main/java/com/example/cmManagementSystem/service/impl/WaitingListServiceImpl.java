package com.example.cmManagementSystem.service.impl;

import com.example.cmManagementSystem.dto.UserDto;
import com.example.cmManagementSystem.dto.WaitingListDto;
import com.example.cmManagementSystem.entity.Event;
import com.example.cmManagementSystem.entity.EventParticipation;
import com.example.cmManagementSystem.entity.User;
import com.example.cmManagementSystem.entity.WaitingList;
import com.example.cmManagementSystem.exception.ResourceNotFoundException;
import com.example.cmManagementSystem.mapper.UserMapper;
import com.example.cmManagementSystem.mapper.WaitingListMapper;
import com.example.cmManagementSystem.repository.EventParticipationRepository;
import com.example.cmManagementSystem.repository.EventRepository;
import com.example.cmManagementSystem.repository.UserRepository;
import com.example.cmManagementSystem.repository.WaitingListRepository;
import com.example.cmManagementSystem.service.WaitingListService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class WaitingListServiceImpl implements WaitingListService {

    private final WaitingListRepository waitingListRepository;
    private final UserRepository userRepository;
    private final EventRepository eventRepository;
    private final EventParticipationRepository eventParticipationRepository;
    private final UserMapper userMapper;
    private final WaitingListMapper waitingListMapper;

    @Override
    @Transactional(readOnly = true)
    public List<WaitingListDto> findAll() {
        List<WaitingList> waitingLists = waitingListRepository.findAll();
        return waitingListMapper.toDtoList(waitingLists);
    }

    @Override
    @Transactional(readOnly = true)
    public WaitingListDto findById(Long id) {
        WaitingList waitingList = waitingListRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("WaitingList", "id", id));
        return waitingListMapper.toDto(waitingList);
    }

    @Override
    @Transactional(readOnly = true)
    public List<WaitingListDto> findByEventId(Long eventId) {
        List<WaitingList> waitingLists = waitingListRepository.findByEventId(eventId);
        return waitingListMapper.toDtoList(waitingLists);
    }

    @Override
    @Transactional(readOnly = true)
    public List<WaitingListDto> findByEvent(Long eventId) {
        // Controller için alias
        return findByEventId(eventId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<UserDto> findUsersByEvent(Long eventId) {
        List<WaitingList> waitingLists = waitingListRepository.findByEventId(eventId);
        return waitingLists.stream()
                .map(waitingList -> userMapper.toDto(waitingList.getUser()))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<WaitingListDto> findByEventIdAndStatus(Long eventId, WaitingList.WaitingStatus status) {
        List<WaitingList> waitingLists = waitingListRepository.findByEventIdAndStatus(eventId, status);
        return waitingListMapper.toDtoList(waitingLists);
    }

    @Override
    @Transactional(readOnly = true)
    public List<WaitingListDto> findByUserId(Long userId) {
        List<WaitingList> waitingLists = waitingListRepository.findByUserId(userId);
        return waitingListMapper.toDtoList(waitingLists);
    }

    @Override
    @Transactional(readOnly = true)
    public WaitingListDto findByEventIdAndUserId(Long eventId, Long userId) {
        WaitingList waitingList = waitingListRepository.findByEventIdAndUserId(eventId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("WaitingList", "eventId and userId", eventId + ", " + userId));
        return waitingListMapper.toDto(waitingList);
    }

    @Override
    @Transactional(readOnly = true)
    public WaitingListDto findByEventAndUser(Long eventId, Long userId) {
        // Controller için alias
        try {
            return findByEventIdAndUserId(eventId, userId);
        } catch (ResourceNotFoundException e) {
            return null; // Kullanıcı bekleme listesinde değilse null dön
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<WaitingListDto> findByEventIdOrderByPositionAsc(Long eventId) {
        List<WaitingList> waitingLists = waitingListRepository.findByEventIdOrderByPositionAsc(eventId);
        return waitingListMapper.toDtoList(waitingLists);
    }

    @Override
    @Transactional(readOnly = true)
    public Integer countByEventIdAndStatus(Long eventId, WaitingList.WaitingStatus status) {
        return waitingListRepository.countByEventIdAndStatus(eventId, status);
    }

    @Override
    @Transactional
    public WaitingListDto createWaitingList(WaitingListDto waitingListDto) {
        Event event = eventRepository.findById(waitingListDto.getEventId())
                .orElseThrow(() -> new ResourceNotFoundException("Event", "id", waitingListDto.getEventId()));
                
        User user = userRepository.findById(waitingListDto.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", waitingListDto.getUserId()));
        
        WaitingList waitingList = waitingListMapper.toEntity(waitingListDto, event, user);
        
        // Yeni pozisyon değerini hesapla (mevcut en yüksek pozisyon + 1)
        List<WaitingList> existingList = waitingListRepository.findByEventIdOrderByPositionAsc(waitingListDto.getEventId());
        int nextPosition = 1;
        if (!existingList.isEmpty()) {
            nextPosition = existingList.stream()
                    .mapToInt(WaitingList::getPosition)
                    .max()
                    .orElse(0) + 1;
        }
        waitingList.setPosition(nextPosition);
        
        WaitingList savedWaitingList = waitingListRepository.save(waitingList);
        return waitingListMapper.toDto(savedWaitingList);
    }

    @Override
    @Transactional
    public WaitingListDto addToWaitingList(Long eventId, Long userId, String note) {
        // Kullanıcı zaten bekleme listesinde mi kontrol et
        if (waitingListRepository.findByEventIdAndUserId(eventId, userId).isPresent()) {
            throw new IllegalStateException("User is already on the waiting list for this event");
        }
        
        // Kullanıcı zaten etkinliğe kayıtlı mı kontrol et
        if (eventParticipationRepository.findByEventIdAndUserId(eventId, userId).isPresent()) {
            throw new IllegalStateException("User is already registered for this event");
        }
        
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new ResourceNotFoundException("Event", "id", eventId));
                
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
        
        // Yeni pozisyon değerini hesapla (mevcut en yüksek pozisyon + 1)
        List<WaitingList> existingList = waitingListRepository.findByEventIdOrderByPositionAsc(eventId);
        int nextPosition = 1;
        if (!existingList.isEmpty()) {
            nextPosition = existingList.stream()
                    .mapToInt(WaitingList::getPosition)
                    .max()
                    .orElse(0) + 1;
        }
        
        WaitingList waitingList = WaitingList.builder()
                .event(event)
                .user(user)
                .joinDate(LocalDateTime.now())
                .status(WaitingList.WaitingStatus.WAITING)
                .position(nextPosition)
                .notificationSent(false)
                .notes(note)
                .build();
        
        WaitingList savedWaitingList = waitingListRepository.save(waitingList);
        return waitingListMapper.toDto(savedWaitingList);
    }

    @Override
    @Transactional
    public WaitingListDto updateWaitingList(Long id, WaitingListDto waitingListDto) {
        WaitingList existingWaitingList = waitingListRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("WaitingList", "id", id));
        
        waitingListMapper.updateEntityFromDto(waitingListDto, existingWaitingList);
        WaitingList updatedWaitingList = waitingListRepository.save(existingWaitingList);
        return waitingListMapper.toDto(updatedWaitingList);
    }

    @Override
    @Transactional
    public WaitingListDto updateStatus(Long id, WaitingList.WaitingStatus status) {
        WaitingList waitingList = waitingListRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("WaitingList", "id", id));
        
        waitingList.setStatus(status);
        
        // Eğer kullanıcı yanıt verdiyse, yanıt zamanını ayarla
        if (status == WaitingList.WaitingStatus.ACCEPTED || status == WaitingList.WaitingStatus.DECLINED) {
            waitingList.setResponseDate(LocalDateTime.now());
        }
        
        WaitingList updatedWaitingList = waitingListRepository.save(waitingList);
        return waitingListMapper.toDto(updatedWaitingList);
    }

    @Override
    @Transactional
    public WaitingListDto markAsNotified(Long id, LocalDateTime notificationDate, LocalDateTime responseDeadline) {
        WaitingList waitingList = waitingListRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("WaitingList", "id", id));
        
        waitingList.setNotificationSent(true);
        waitingList.setNotificationDate(notificationDate);
        waitingList.setResponseDeadline(responseDeadline);
        waitingList.setStatus(WaitingList.WaitingStatus.NOTIFIED);
        
        WaitingList updatedWaitingList = waitingListRepository.save(waitingList);
        return waitingListMapper.toDto(updatedWaitingList);
    }

    @Override
    @Transactional(readOnly = true)
    public List<WaitingListDto> findPendingNotifications() {
        // Bildirim gönderilmemiş ve bekleme durumundaki kayıtları getir
        List<WaitingList> waitingLists = waitingListRepository.findByNotificationSentAndStatus(
                false, WaitingList.WaitingStatus.WAITING);
        
        return waitingListMapper.toDtoList(waitingLists);
    }

    @Override
    @Transactional(readOnly = true)
    public List<WaitingListDto> findExpiredNotifications(LocalDateTime now) {
        // Yanıt süresi dolmuş ve bildirim gönderilmiş kayıtları getir
        List<WaitingList> expiredNotifications = waitingListRepository.findByStatusAndResponseDeadlineBefore(
                WaitingList.WaitingStatus.NOTIFIED, now);
        
        return waitingListMapper.toDtoList(expiredNotifications);
    }

    @Override
    @Transactional
    public void deleteWaitingList(Long id) {
        if (!waitingListRepository.existsById(id)) {
            throw new ResourceNotFoundException("WaitingList", "id", id);
        }
        waitingListRepository.deleteById(id);
    }

    @Override
    @Transactional
    public void removeFromWaitingList(Long eventId, Long userId) {
        WaitingList waitingList = waitingListRepository.findByEventIdAndUserId(eventId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("WaitingList", "eventId and userId", eventId + ", " + userId));
        
        waitingListRepository.delete(waitingList);
        
        // Sıralama pozisyonlarını yeniden düzenle
        List<WaitingList> remainingList = waitingListRepository.findByEventIdOrderByPositionAsc(eventId);
        for (int i = 0; i < remainingList.size(); i++) {
            WaitingList item = remainingList.get(i);
            item.setPosition(i + 1);
            waitingListRepository.save(item);
        }
    }

    @Override
    @Transactional
    public WaitingListDto promoteToParticipant(Long waitingListId) {
        WaitingList waitingList = waitingListRepository.findById(waitingListId)
                .orElseThrow(() -> new ResourceNotFoundException("WaitingList", "id", waitingListId));
        
        // Kullanıcıyı etkinliğe katılımcı olarak ekle
        EventParticipation participation = EventParticipation.builder()
                .event(waitingList.getEvent())
                .user(waitingList.getUser())
                .status(EventParticipation.ParticipationStatus.REGISTERED)
                .registrationDate(LocalDateTime.now())
                .build();
        
        eventParticipationRepository.save(participation);
        
        // Bekleme listesi durumunu ACCEPTED olarak güncelle
        waitingList.setStatus(WaitingList.WaitingStatus.ACCEPTED);
        waitingList.setResponseDate(LocalDateTime.now());
        WaitingList updatedWaitingList = waitingListRepository.save(waitingList);
        
        return waitingListMapper.toDto(updatedWaitingList);
    }

    @Override
    @Transactional
    public void promoteToParticipant(Long eventId, Long userId) {
        WaitingList waitingList = waitingListRepository.findByEventIdAndUserId(eventId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("WaitingList", "eventId and userId", eventId + ", " + userId));
        
        promoteToParticipant(waitingList.getId());
    }

    @Override
    @Transactional
    public List<WaitingListDto> reorderWaitingList(Long eventId, List<WaitingListDto> waitingListItems) {
        // Önce eventId ile ilgili tüm bekleme listesi öğelerini al
        List<WaitingList> existingItems = waitingListRepository.findByEventId(eventId);
        
        // DTO listesindeki her öğe için, veritabanındaki karşılığını bul ve pozisyonunu güncelle
        for (WaitingListDto itemDto : waitingListItems) {
            WaitingList item = existingItems.stream()
                    .filter(wl -> wl.getId().equals(itemDto.getId()))
                    .findFirst()
                    .orElseThrow(() -> new ResourceNotFoundException("WaitingList", "id", itemDto.getId()));
            
            item.setPosition(itemDto.getPosition());
            waitingListRepository.save(item);
        }
        
        // Güncellenen listeyi döndür
        List<WaitingList> updatedItems = waitingListRepository.findByEventIdOrderByPositionAsc(eventId);
        return waitingListMapper.toDtoList(updatedItems);
    }

    @Override
    @Transactional
    public List<WaitingListDto> notifyWaitlistForAvailableSlots(Long eventId, int availableSlots, int responseDeadlineHours) {
        // Etkinliği kontrol et
        if (!eventRepository.existsById(eventId)) {
            throw new ResourceNotFoundException("Event", "id", eventId);
        }
        
        // Bekleme listesinde sıralı şekilde WAITING durumundaki öğeleri al
        List<WaitingList> waitingItems = waitingListRepository.findByEventIdAndStatus(eventId, WaitingList.WaitingStatus.WAITING);
        waitingItems.sort(Comparator.comparing(WaitingList::getPosition));
        
        // Bildirim gönderilecek öğeleri seç (maksimum availableSlots kadar)
        List<WaitingList> itemsToNotify = waitingItems.stream()
                .limit(availableSlots)
                .collect(Collectors.toList());
        
        // Seçilen öğeleri NOTIFIED olarak işaretle ve yanıt tarihini ayarla
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime deadline = now.plusHours(responseDeadlineHours);
        
        List<WaitingList> notifiedItems = new ArrayList<>();
        for (WaitingList item : itemsToNotify) {
            item.setNotificationSent(true);
            item.setNotificationDate(now);
            item.setResponseDeadline(deadline);
            item.setStatus(WaitingList.WaitingStatus.NOTIFIED);
            
            WaitingList updatedItem = waitingListRepository.save(item);
            notifiedItems.add(updatedItem);
        }
        
        return waitingListMapper.toDtoList(notifiedItems);
    }

    @Override
    @Transactional
    public int autoPromoteFromWaitingList(Long eventId, int limit) {
        // Etkinliği kontrol et
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new ResourceNotFoundException("Event", "id", eventId));
        
        // Mevcut katılımcı sayısını hesapla
        int currentParticipants = eventParticipationRepository.countParticipantsByEventId(eventId);
        
        // Boş kontenjan sayısını hesapla
        int availableSlots = event.getCapacity() - currentParticipants;
        if (availableSlots <= 0) {
            return 0;  // Boş kontenjan yok
        }
        
        // Limit değerini boş kontenjan sayısı ile sınırla
        int slotsToFill = (limit == 0 || limit > availableSlots) ? availableSlots : limit;
        
        // Bekleme listesindeki kullanıcıları sıraya göre al
        List<WaitingList> waitingList = waitingListRepository.findByEventIdOrderByPositionAsc(eventId);
        waitingList = waitingList.stream()
                .filter(wl -> wl.getStatus() == WaitingList.WaitingStatus.WAITING || 
                             wl.getStatus() == WaitingList.WaitingStatus.ACCEPTED)
                .limit(slotsToFill)
                .collect(Collectors.toList());
        
        int promotedCount = 0;
        for (WaitingList waitingItem : waitingList) {
            // Daha önce katılımcı olarak eklenmiş mi kontrol et
            if (eventParticipationRepository.findByEventIdAndUserId(eventId, waitingItem.getUser().getId()).isEmpty()) {
                // Katılımcı olarak ekle
                EventParticipation participation = EventParticipation.builder()
                        .event(event)
                        .user(waitingItem.getUser())
                        .status(EventParticipation.ParticipationStatus.REGISTERED)
                        .registrationDate(LocalDateTime.now())
                        .build();
                
                eventParticipationRepository.save(participation);
                
                // Bekleme listesi durumunu güncelle
                waitingItem.setStatus(WaitingList.WaitingStatus.ACCEPTED);
                waitingItem.setResponseDate(LocalDateTime.now());
                waitingListRepository.save(waitingItem);
                
                promotedCount++;
            }
        }
        
        return promotedCount;
    }
} 