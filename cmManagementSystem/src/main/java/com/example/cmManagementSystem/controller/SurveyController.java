package com.example.cmManagementSystem.controller;

import com.example.cmManagementSystem.dto.SurveyDto;
import com.example.cmManagementSystem.dto.SurveyQuestionDto;
import com.example.cmManagementSystem.dto.SurveyResponseDto;
import com.example.cmManagementSystem.service.SurveyService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/surveys")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class SurveyController {
    
    private final SurveyService surveyService;
    
    @Autowired
    public SurveyController(SurveyService surveyService) {
        this.surveyService = surveyService;
    }
    
    // Tüm anketleri getir
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<SurveyDto>> getAllSurveys() {
        return ResponseEntity.ok(surveyService.findAll());
    }
    
    // ID'ye göre anket getir
    @GetMapping("/{id}")
    public ResponseEntity<SurveyDto> getSurveyById(@PathVariable Long id) {
        return ResponseEntity.ok(surveyService.findById(id));
    }
    
    // Etkinliğe ait anketleri getir
    @GetMapping("/event/{eventId}")
    public ResponseEntity<List<SurveyDto>> getSurveysByEvent(@PathVariable Long eventId) {
        return ResponseEntity.ok(surveyService.findByEvent(eventId));
    }
    
    // Kulübe ait anketleri getir
    @GetMapping("/club/{clubId}")
    @PreAuthorize("hasRole('ADMIN') or (hasRole('CLUB_PRESIDENT') and @clubAuthService.isPresidentOfClub(authentication.principal, #clubId))")
    public ResponseEntity<List<SurveyDto>> getSurveysByClub(@PathVariable Long clubId) {
        return ResponseEntity.ok(surveyService.findByClub(clubId));
    }
    
    // Yeni anket oluştur (ADMIN veya CLUB_PRESIDENT)
    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('CLUB_PRESIDENT')")
    public ResponseEntity<SurveyDto> createSurvey(@Valid @RequestBody SurveyDto surveyDto) {
        return new ResponseEntity<>(surveyService.createSurvey(surveyDto), HttpStatus.CREATED);
    }
    
    // Etkinliğe anket ekle (ADMIN veya CLUB_PRESIDENT)
    @PostMapping("/event/{eventId}")
    @PreAuthorize("hasRole('ADMIN') or (hasRole('CLUB_PRESIDENT') and @eventAuthService.isEventCreatedByUser(authentication.principal, #eventId))")
    public ResponseEntity<SurveyDto> createEventSurvey(
            @PathVariable Long eventId,
            @Valid @RequestBody SurveyDto surveyDto) {
        return new ResponseEntity<>(surveyService.createEventSurvey(eventId, surveyDto), HttpStatus.CREATED);
    }
    
    // Anketi güncelle (ADMIN veya CLUB_PRESIDENT)
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or (hasRole('CLUB_PRESIDENT') and @surveyService.isSurveyCreatedByUser(authentication.principal, #id))")
    public ResponseEntity<SurveyDto> updateSurvey(
            @PathVariable Long id,
            @Valid @RequestBody SurveyDto surveyDto) {
        return ResponseEntity.ok(surveyService.updateSurvey(id, surveyDto));
    }
    
    // Anketi sil (ADMIN veya CLUB_PRESIDENT)
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or (hasRole('CLUB_PRESIDENT') and @surveyService.isSurveyCreatedByUser(authentication.principal, #id))")
    public ResponseEntity<Void> deleteSurvey(@PathVariable Long id) {
        surveyService.deleteSurvey(id);
        return ResponseEntity.noContent().build();
    }
    
    // Ankete soru ekle (ADMIN veya CLUB_PRESIDENT)
    @PostMapping("/{id}/questions")
    @PreAuthorize("hasRole('ADMIN') or (hasRole('CLUB_PRESIDENT') and @surveyService.isSurveyCreatedByUser(authentication.principal, #id))")
    public ResponseEntity<SurveyQuestionDto> addSurveyQuestion(
            @PathVariable Long id,
            @Valid @RequestBody SurveyQuestionDto questionDto) {
        return new ResponseEntity<>(surveyService.addQuestion(id, questionDto), HttpStatus.CREATED);
    }
    
    // Anket sorusunu güncelle (ADMIN veya CLUB_PRESIDENT)
    @PutMapping("/questions/{id}")
    @PreAuthorize("hasRole('ADMIN') or (hasRole('CLUB_PRESIDENT') and @surveyService.isQuestionInSurveyCreatedByUser(authentication.principal, #id))")
    public ResponseEntity<SurveyQuestionDto> updateSurveyQuestion(
            @PathVariable Long id,
            @Valid @RequestBody SurveyQuestionDto questionDto) {
        return ResponseEntity.ok(surveyService.updateQuestion(id, questionDto));
    }
    
    // Anket sorusunu sil (ADMIN veya CLUB_PRESIDENT)
    @DeleteMapping("/questions/{id}")
    @PreAuthorize("hasRole('ADMIN') or (hasRole('CLUB_PRESIDENT') and @surveyService.isQuestionInSurveyCreatedByUser(authentication.principal, #id))")
    public ResponseEntity<Void> deleteSurveyQuestion(@PathVariable Long id) {
        surveyService.deleteQuestion(id);
        return ResponseEntity.noContent().build();
    }
    
    // Ankete yanıt gönder
    @PostMapping("/{id}/responses")
    public ResponseEntity<SurveyResponseDto> submitSurveyResponse(
            @PathVariable Long id,
            @Valid @RequestBody SurveyResponseDto responseDto) {
        return new ResponseEntity<>(surveyService.submitResponse(id, responseDto), HttpStatus.CREATED);
    }
    
    // Anket yanıtlarını getir (ADMIN veya CLUB_PRESIDENT)
    @GetMapping("/{id}/responses")
    @PreAuthorize("hasRole('ADMIN') or (hasRole('CLUB_PRESIDENT') and @surveyService.isSurveyCreatedByUser(authentication.principal, #id))")
    public ResponseEntity<List<SurveyResponseDto>> getSurveyResponses(@PathVariable Long id) {
        return ResponseEntity.ok(surveyService.getResponses(id));
    }
    
    // Anket sonuçlarını analiz et (ADMIN veya CLUB_PRESIDENT)
    @GetMapping("/{id}/results")
    @PreAuthorize("hasRole('ADMIN') or (hasRole('CLUB_PRESIDENT') and @surveyService.isSurveyCreatedByUser(authentication.principal, #id))")
    public ResponseEntity<Map<String, Object>> analyzeSurveyResults(@PathVariable Long id) {
        return ResponseEntity.ok(surveyService.analyzeResults(id));
    }
} 