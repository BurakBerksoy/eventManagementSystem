package com.example.cmManagementSystem.service;

import com.example.cmManagementSystem.dto.CateringDto;
import com.example.cmManagementSystem.dto.EventDto;
import com.example.cmManagementSystem.dto.EventProgramDto;
import com.example.cmManagementSystem.dto.EventSpeakerDto;
import com.example.cmManagementSystem.dto.SurveyDto;
import com.example.cmManagementSystem.dto.VenueReservationDto;
import com.example.cmManagementSystem.dto.WaitingListDto;
import com.example.cmManagementSystem.entity.Event;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface EventService {
    
    /**
     * Tüm etkinlikleri sayfalandırılmış şekilde getirir
     *
     * @param pageable Sayfalandırma bilgileri
     * @return Etkinlik sayfası
     */
    Page<EventDto> findAll(Pageable pageable);
    
    /**
     * ID'ye göre etkinlik getirir
     *
     * @param id Etkinlik ID
     * @return Etkinlik
     */
    EventDto findById(Long id);
    
    /**
     * Duruma göre etkinlikleri getirir
     *
     * @param status Etkinlik durumu
     * @param pageable Sayfalandırma bilgileri
     * @return Etkinlik sayfası
     */
    Page<EventDto> findByStatus(Event.EventStatus status, Pageable pageable);
    
    /**
     * Kategoriye göre etkinlikleri getirir
     *
     * @param category Kategori
     * @param pageable Sayfalandırma bilgileri
     * @return Etkinlik sayfası
     */
    Page<EventDto> findByCategory(String category, Pageable pageable);
    
    /**
     * Kulübe göre etkinlikleri getirir
     *
     * @param clubId Kulüp ID
     * @param pageable Sayfalandırma bilgileri
     * @return Etkinlik sayfası
     */
    Page<EventDto> findByClubId(Long clubId, Pageable pageable);
    
    /**
     * Yeni etkinlik oluşturur
     *
     * @param eventDto Etkinlik verileri
     * @return Oluşturulan etkinlik
     */
    EventDto createEvent(EventDto eventDto);
    
    /**
     * Etkinlik bilgilerini günceller
     *
     * @param id Etkinlik ID
     * @param eventDto Güncellenecek veriler
     * @return Güncellenen etkinlik
     */
    EventDto updateEvent(Long id, EventDto eventDto);
    
    /**
     * Etkinliği siler
     *
     * @param id Silinecek etkinlik ID
     */
    void deleteEvent(Long id);
    
    /**
     * Etkinlik durumunu günceller
     *
     * @param id Etkinlik ID
     * @param status Yeni durum
     * @return Güncellenen etkinlik
     */
    EventDto updateEventStatus(Long id, Event.EventStatus status);
    
    /**
     * Etkinliğe katılım kaydı oluşturur
     *
     * @param eventId Etkinlik ID
     * @param userId Kullanıcı ID
     */
    void registerForEvent(Long eventId, Long userId);
    
    /**
     * Etkinlik katılımını iptal eder
     *
     * @param eventId Etkinlik ID
     * @param userId Kullanıcı ID
     */
    void cancelRegistration(Long eventId, Long userId);
    
    /**
     * Tüm etkinlik kategorilerini getirir
     *
     * @return Kategori listesi
     */
    List<String> findAllCategories();
    
    /**
     * Kullanıcının katıldığı etkinlikleri getirir
     *
     * @param userId Kullanıcı ID
     * @return Etkinlik listesi
     */
    List<EventDto> findEventsByParticipant(Long userId);
    
    /**
     * Etkinliğe ait konuşmacıları getirir
     *
     * @param eventId Etkinlik ID
     * @return Konuşmacı listesi
     */
    List<EventSpeakerDto> getEventSpeakers(Long eventId);
    
    /**
     * Etkinliğe konuşmacı ekler
     *
     * @param eventId Etkinlik ID
     * @param speakerDto Konuşmacı bilgileri
     * @return Eklenen konuşmacı
     */
    EventSpeakerDto addEventSpeaker(Long eventId, EventSpeakerDto speakerDto);
    
    /**
     * Etkinlik konuşmacısını günceller
     *
     * @param eventId Etkinlik ID
     * @param speakerId Konuşmacı ID
     * @param speakerDto Güncellenecek bilgiler
     * @return Güncellenen konuşmacı
     */
    EventSpeakerDto updateEventSpeaker(Long eventId, Long speakerId, EventSpeakerDto speakerDto);
    
    /**
     * Etkinlik konuşmacısını siler
     *
     * @param eventId Etkinlik ID
     * @param speakerId Konuşmacı ID
     */
    void deleteEventSpeaker(Long eventId, Long speakerId);
    
    /**
     * Etkinlik programını getirir
     *
     * @param eventId Etkinlik ID
     * @return Program listesi
     */
    List<EventProgramDto> getEventProgram(Long eventId);
    
    /**
     * Etkinliğe program ekler
     *
     * @param eventId Etkinlik ID
     * @param programDto Program bilgileri
     * @return Eklenen program
     */
    EventProgramDto addEventProgram(Long eventId, EventProgramDto programDto);
    
    /**
     * Etkinlik programını günceller
     *
     * @param eventId Etkinlik ID
     * @param programId Program ID
     * @param programDto Güncellenecek bilgiler
     * @return Güncellenen program
     */
    EventProgramDto updateEventProgram(Long eventId, Long programId, EventProgramDto programDto);
    
    /**
     * Etkinlik programını siler
     *
     * @param eventId Etkinlik ID
     * @param programId Program ID
     */
    void deleteEventProgram(Long eventId, Long programId);
    
    /**
     * Etkinlik ikramını getirir
     *
     * @param eventId Etkinlik ID
     * @return İkram bilgileri
     */
    CateringDto getEventCatering(Long eventId);
    
    /**
     * Etkinliğe ikram ekler
     *
     * @param eventId Etkinlik ID
     * @param cateringDto İkram bilgileri
     * @return Eklenen ikram
     */
    CateringDto addEventCatering(Long eventId, CateringDto cateringDto);
    
    /**
     * Etkinlik ikramını günceller
     *
     * @param eventId Etkinlik ID
     * @param cateringId İkram ID
     * @param cateringDto Güncellenecek bilgiler
     * @return Güncellenen ikram
     */
    CateringDto updateEventCatering(Long eventId, Long cateringId, CateringDto cateringDto);
    
    /**
     * Etkinlik ikramını siler
     *
     * @param eventId Etkinlik ID
     * @param cateringId İkram ID
     */
    void deleteEventCatering(Long eventId, Long cateringId);
    
    /**
     * Etkinlik bekleme listesini getirir
     *
     * @param eventId Etkinlik ID
     * @return Bekleme listesi
     */
    List<WaitingListDto> getWaitingList(Long eventId);
    
    /**
     * Bekleme listesine kullanıcı ekler
     *
     * @param eventId Etkinlik ID
     * @param userId Kullanıcı ID
     * @return Bekleme listesi kaydı
     */
    WaitingListDto addToWaitingList(Long eventId, Long userId);
    
    /**
     * Bekleme listesinden kullanıcı çıkarır
     *
     * @param eventId Etkinlik ID
     * @param userId Kullanıcı ID
     */
    void removeFromWaitingList(Long eventId, Long userId);
    
    /**
     * Etkinlik mekan rezervasyonlarını getirir
     *
     * @param eventId Etkinlik ID
     * @return Mekan rezervasyonları
     */
    List<VenueReservationDto> getVenueReservations(Long eventId);
    
    /**
     * Etkinlik anketlerini getirir
     *
     * @param eventId Etkinlik ID
     * @return Anket listesi
     */
    List<SurveyDto> getEventSurveys(Long eventId);
    
    /**
     * Etkinliğe ait anket detaylarını getirir
     *
     * @param eventId Etkinlik ID
     * @param surveyId Anket ID
     * @return Anket detayları
     */
    SurveyDto getSurveyDetails(Long eventId, Long surveyId);
} 