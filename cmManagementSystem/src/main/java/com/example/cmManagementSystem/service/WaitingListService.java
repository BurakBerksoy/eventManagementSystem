package com.example.cmManagementSystem.service;

import com.example.cmManagementSystem.dto.UserDto;
import com.example.cmManagementSystem.dto.WaitingListDto;
import com.example.cmManagementSystem.entity.WaitingList;

import java.time.LocalDateTime;
import java.util.List;

public interface WaitingListService {
    
    /**
     * Tüm bekleme listesi kayıtlarını getirir
     * 
     * @return Bekleme listesi kayıtları
     */
    List<WaitingListDto> findAll();
    
    /**
     * ID'ye göre bekleme listesi kaydı getirir
     * 
     * @param id Bekleme listesi kaydı ID
     * @return Bekleme listesi kaydı
     */
    WaitingListDto findById(Long id);
    
    /**
     * Etkinliğe göre bekleme listesi kayıtlarını getirir
     * 
     * @param eventId Etkinlik ID
     * @return Bekleme listesi kayıtları
     */
    List<WaitingListDto> findByEventId(Long eventId);
    
    /**
     * Etkinliğe göre bekleme listesi kayıtlarını getirir
     * WaitingListController için kullanılacak
     * 
     * @param eventId Etkinlik ID
     * @return Bekleme listesi kayıtları
     */
    List<WaitingListDto> findByEvent(Long eventId);
    
    /**
     * Etkinlik bekleme listesindeki kullanıcıları getirir
     * 
     * @param eventId Etkinlik ID
     * @return Kullanıcı listesi
     */
    List<UserDto> findUsersByEvent(Long eventId);
    
    /**
     * Etkinliğe ve duruma göre bekleme listesi kayıtlarını getirir
     * 
     * @param eventId Etkinlik ID
     * @param status Bekleme listesi durumu
     * @return Bekleme listesi kayıtları
     */
    List<WaitingListDto> findByEventIdAndStatus(Long eventId, WaitingList.WaitingStatus status);
    
    /**
     * Kullanıcıya göre bekleme listesi kayıtlarını getirir
     * 
     * @param userId Kullanıcı ID
     * @return Bekleme listesi kayıtları
     */
    List<WaitingListDto> findByUserId(Long userId);
    
    /**
     * Etkinlik ve kullanıcıya göre bekleme listesi kaydı getirir
     * 
     * @param eventId Etkinlik ID
     * @param userId Kullanıcı ID
     * @return Bekleme listesi kaydı
     */
    WaitingListDto findByEventIdAndUserId(Long eventId, Long userId);
    
    /**
     * Etkinlik ve kullanıcıya göre bekleme listesi kaydı getirir
     * WaitingListController için kullanılacak
     * 
     * @param eventId Etkinlik ID
     * @param userId Kullanıcı ID
     * @return Bekleme listesi kaydı
     */
    WaitingListDto findByEventAndUser(Long eventId, Long userId);
    
    /**
     * Etkinliğe göre bekleme listesi kayıtlarını sıra numarasına göre sıralı getirir
     * 
     * @param eventId Etkinlik ID
     * @return Bekleme listesi kayıtları
     */
    List<WaitingListDto> findByEventIdOrderByPositionAsc(Long eventId);
    
    /**
     * Etkinlik için beklemedekileri sayar
     * 
     * @param eventId Etkinlik ID
     * @param status Bekleme durumu
     * @return Bekleme listesindeki kişi sayısı
     */
    Integer countByEventIdAndStatus(Long eventId, WaitingList.WaitingStatus status);
    
    /**
     * Yeni bekleme listesi kaydı oluşturur
     * 
     * @param waitingListDto Bekleme listesi bilgileri
     * @return Oluşturulan bekleme listesi kaydı
     */
    WaitingListDto createWaitingList(WaitingListDto waitingListDto);
    
    /**
     * Kullanıcıyı bekleme listesine ekler
     * 
     * @param eventId Etkinlik ID
     * @param userId Kullanıcı ID
     * @param note Kullanıcı notu (isteğe bağlı)
     * @return Oluşturulan bekleme listesi kaydı
     */
    WaitingListDto addToWaitingList(Long eventId, Long userId, String note);
    
    /**
     * Bekleme listesi bilgilerini günceller
     * 
     * @param id Bekleme listesi ID
     * @param waitingListDto Güncellenecek bilgiler
     * @return Güncellenen bekleme listesi kaydı
     */
    WaitingListDto updateWaitingList(Long id, WaitingListDto waitingListDto);
    
    /**
     * Bekleme listesi durumunu günceller
     * 
     * @param id Bekleme listesi ID
     * @param status Yeni durum
     * @return Güncellenen bekleme listesi kaydı
     */
    WaitingListDto updateStatus(Long id, WaitingList.WaitingStatus status);
    
    /**
     * Bekleme listesi bildirim gönderildi olarak işaretler
     * 
     * @param id Bekleme listesi ID
     * @param notificationDate Bildirim tarihi
     * @param responseDeadline Yanıt tarihi
     * @return Güncellenen bekleme listesi kaydı
     */
    WaitingListDto markAsNotified(Long id, LocalDateTime notificationDate, LocalDateTime responseDeadline);
    
    /**
     * Bildirim gönderilmemiş ve bekleme durumundaki kayıtları getirir
     * 
     * @return Bekleme listesi kayıtları
     */
    List<WaitingListDto> findPendingNotifications();
    
    /**
     * Yanıt süresi dolmuş bildirim gönderilmiş kayıtları getirir
     * 
     * @param now Şu anki zaman
     * @return Süresi dolmuş bekleme listesi kayıtları
     */
    List<WaitingListDto> findExpiredNotifications(LocalDateTime now);
    
    /**
     * Bekleme listesi kaydını siler
     * 
     * @param id Silinecek bekleme listesi ID
     */
    void deleteWaitingList(Long id);
    
    /**
     * Kullanıcıyı bekleme listesinden çıkarır
     * 
     * @param eventId Etkinlik ID
     * @param userId Kullanıcı ID
     */
    void removeFromWaitingList(Long eventId, Long userId);
    
    /**
     * Etkinlik için bekleme listesindeki bir kişiyi katılımcı olarak ilerletir
     * 
     * @param waitingListId Bekleme listesi ID
     * @return Güncellenen bekleme listesi kaydı
     */
    WaitingListDto promoteToParticipant(Long waitingListId);
    
    /**
     * Etkinlik için bekleme listesindeki bir kişiyi katılımcı olarak ilerletir
     * WaitingListController için kullanılacak
     * 
     * @param eventId Etkinlik ID
     * @param userId Kullanıcı ID
     */
    void promoteToParticipant(Long eventId, Long userId);
    
    /**
     * Bekleme listesinin sırasını değiştirir (öncelik ayarı)
     * 
     * @param eventId Etkinlik ID
     * @param waitingListItems Yeni sıralama ile bekleme listesi kayıtları
     * @return Güncellenen bekleme listesi kayıtları
     */
    List<WaitingListDto> reorderWaitingList(Long eventId, List<WaitingListDto> waitingListItems);
    
    /**
     * Etkinlik için kontenjan açıldığında bekleme listesindeki kişilere otomatik bildirim gönderir
     * 
     * @param eventId Etkinlik ID
     * @param availableSlots Açılan kontenjan sayısı
     * @param responseDeadlineHours Yanıt süresi (saat)
     * @return Bildirim gönderilen bekleme listesi kayıtları
     */
    List<WaitingListDto> notifyWaitlistForAvailableSlots(Long eventId, int availableSlots, int responseDeadlineHours);
    
    /**
     * Bekleme listesindeki kişileri otomatik olarak katılımcı listesine ekler
     * 
     * @param eventId Etkinlik ID
     * @param limit Maksimum eklenecek kişi sayısı (0=sınırsız)
     * @return Katılımcı olarak eklenen kişi sayısı
     */
    int autoPromoteFromWaitingList(Long eventId, int limit);
} 