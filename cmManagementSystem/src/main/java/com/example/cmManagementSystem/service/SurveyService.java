package com.example.cmManagementSystem.service;

import com.example.cmManagementSystem.dto.SurveyDto;
import com.example.cmManagementSystem.dto.SurveyQuestionDto;
import com.example.cmManagementSystem.dto.SurveyResponseDto;

import java.util.List;
import java.util.Map;

/**
 * Anket işlemlerini yöneten servis
 */
public interface SurveyService {
    
    /**
     * Tüm anketleri getirir
     */
    List<SurveyDto> findAll();
    
    /**
     * ID'ye göre anket getirir
     */
    SurveyDto findById(Long id);
    
    /**
     * Etkinliğe ait anketleri getirir
     */
    List<SurveyDto> findByEvent(Long eventId);
    
    /**
     * Kulübe ait anketleri getirir
     */
    List<SurveyDto> findByClub(Long clubId);
    
    /**
     * Yeni anket oluşturur
     */
    SurveyDto createSurvey(SurveyDto surveyDto);
    
    /**
     * Etkinliğe yeni anket ekler
     */
    SurveyDto createEventSurvey(Long eventId, SurveyDto surveyDto);
    
    /**
     * Anketi günceller
     */
    SurveyDto updateSurvey(Long id, SurveyDto surveyDto);
    
    /**
     * Anketi siler
     */
    void deleteSurvey(Long id);
    
    /**
     * Ankete soru ekler
     */
    SurveyQuestionDto addQuestion(Long surveyId, SurveyQuestionDto questionDto);
    
    /**
     * Anket sorusunu günceller
     */
    SurveyQuestionDto updateQuestion(Long questionId, SurveyQuestionDto questionDto);
    
    /**
     * Anket sorusunu siler
     */
    void deleteQuestion(Long questionId);
    
    /**
     * Ankete yanıt gönderir
     */
    SurveyResponseDto submitResponse(Long surveyId, SurveyResponseDto responseDto);
    
    /**
     * Anket yanıtlarını getirir
     */
    List<SurveyResponseDto> getResponses(Long surveyId);
    
    /**
     * Anket sonuçlarını analiz eder
     */
    Map<String, Object> analyzeResults(Long surveyId);
    
    /**
     * Belirtilen kullanıcının anketin sahibi olup olmadığını kontrol eder
     */
    boolean isSurveyCreatedByUser(Long userId, Long surveyId);
    
    /**
     * Belirtilen kullanıcının sorunun bulunduğu anketin sahibi olup olmadığını kontrol eder
     */
    boolean isQuestionInSurveyCreatedByUser(Long userId, Long questionId);
} 