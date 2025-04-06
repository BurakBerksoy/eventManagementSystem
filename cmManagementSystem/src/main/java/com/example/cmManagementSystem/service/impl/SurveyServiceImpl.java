package com.example.cmManagementSystem.service.impl;

import com.example.cmManagementSystem.dto.SurveyDto;
import com.example.cmManagementSystem.dto.SurveyQuestionDto;
import com.example.cmManagementSystem.dto.SurveyResponseDto;
import com.example.cmManagementSystem.entity.Club;
import com.example.cmManagementSystem.entity.Event;
import com.example.cmManagementSystem.entity.Survey;
import com.example.cmManagementSystem.entity.SurveyQuestion;
import com.example.cmManagementSystem.entity.SurveyResponse;
import com.example.cmManagementSystem.entity.User;
import com.example.cmManagementSystem.exception.ResourceNotFoundException;
import com.example.cmManagementSystem.repository.ClubRepository;
import com.example.cmManagementSystem.repository.EventRepository;
import com.example.cmManagementSystem.repository.SurveyQuestionRepository;
import com.example.cmManagementSystem.repository.SurveyRepository;
import com.example.cmManagementSystem.repository.SurveyResponseRepository;
import com.example.cmManagementSystem.repository.UserRepository;
import com.example.cmManagementSystem.service.SurveyService;
import lombok.extern.slf4j.Slf4j;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@Slf4j
@Transactional
public class SurveyServiceImpl implements SurveyService {
    
    private final SurveyRepository surveyRepository;
    private final SurveyQuestionRepository questionRepository;
    private final SurveyResponseRepository responseRepository;
    private final ClubRepository clubRepository;
    private final EventRepository eventRepository;
    private final UserRepository userRepository;
    private final ModelMapper modelMapper;
    
    @Autowired
    public SurveyServiceImpl(
            SurveyRepository surveyRepository,
            SurveyQuestionRepository questionRepository,
            SurveyResponseRepository responseRepository,
            ClubRepository clubRepository,
            EventRepository eventRepository,
            UserRepository userRepository,
            ModelMapper modelMapper) {
        this.surveyRepository = surveyRepository;
        this.questionRepository = questionRepository;
        this.responseRepository = responseRepository;
        this.clubRepository = clubRepository;
        this.eventRepository = eventRepository;
        this.userRepository = userRepository;
        this.modelMapper = modelMapper;
    }
    
    @Override
    public List<SurveyDto> findAll() {
        List<Survey> surveys = surveyRepository.findAll();
        return surveys.stream()
                .map(this::mapToSurveyDto)
                .collect(Collectors.toList());
    }
    
    @Override
    public SurveyDto findById(Long id) {
        Survey survey = surveyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Survey", "id", id));
        return mapToSurveyDto(survey);
    }
    
    @Override
    public List<SurveyDto> findByEvent(Long eventId) {
        List<Survey> surveys = surveyRepository.findByEventId(eventId);
        return surveys.stream()
                .map(this::mapToSurveyDto)
                .collect(Collectors.toList());
    }
    
    @Override
    public List<SurveyDto> findByClub(Long clubId) {
        List<Survey> surveys = surveyRepository.findByClubId(clubId);
        return surveys.stream()
                .map(this::mapToSurveyDto)
                .collect(Collectors.toList());
    }
    
    @Override
    @Transactional
    public SurveyDto createSurvey(SurveyDto surveyDto) {
        Survey survey = new Survey();
        
        // Temel bilgileri ayarla
        survey.setTitle(surveyDto.getTitle());
        survey.setDescription(surveyDto.getDescription());
        survey.setStartDate(surveyDto.getStartDate());
        survey.setEndDate(surveyDto.getEndDate());
        survey.setIsAnonymous(surveyDto.getIsAnonymous());
        survey.setIsPublished(surveyDto.getIsPublished());
        survey.setIsRequired(surveyDto.getIsRequired());
        survey.setTargetAudience(surveyDto.getTargetAudience());
        survey.setMaxResponses(surveyDto.getMaxResponses());
        
        // Kullanıcıyı ayarla
        User createdBy = userRepository.findById(surveyDto.getCreatedById())
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", surveyDto.getCreatedById()));
        survey.setCreatedBy(createdBy);
        
        // Kulüp ilişkisini ayarla (varsa)
        if (surveyDto.getClubId() != null) {
            Club club = clubRepository.findById(surveyDto.getClubId())
                    .orElseThrow(() -> new ResourceNotFoundException("Club", "id", surveyDto.getClubId()));
            survey.setClub(club);
        }
        
        // Etkinlik ilişkisini ayarla (varsa)
        if (surveyDto.getEventId() != null) {
            Event event = eventRepository.findById(surveyDto.getEventId())
                    .orElseThrow(() -> new ResourceNotFoundException("Event", "id", surveyDto.getEventId()));
            survey.setEvent(event);
        }
        
        // Anketi kaydet
        Survey savedSurvey = surveyRepository.save(survey);
        
        return mapToSurveyDto(savedSurvey);
    }
    
    @Override
    @Transactional
    public SurveyDto createEventSurvey(Long eventId, SurveyDto surveyDto) {
        // Etkinliği kontrol et
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new ResourceNotFoundException("Event", "id", eventId));
        
        // Anket DTO'suna etkinlik ID'sini ekle
        surveyDto.setEventId(eventId);
        
        // Anketi oluştur
        return createSurvey(surveyDto);
    }
    
    @Override
    @Transactional
    public SurveyDto updateSurvey(Long id, SurveyDto surveyDto) {
        // Anketi bul
        Survey survey = surveyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Survey", "id", id));
        
        // Temel bilgileri güncelle
        survey.setTitle(surveyDto.getTitle());
        survey.setDescription(surveyDto.getDescription());
        survey.setStartDate(surveyDto.getStartDate());
        survey.setEndDate(surveyDto.getEndDate());
        survey.setIsAnonymous(surveyDto.getIsAnonymous());
        survey.setIsPublished(surveyDto.getIsPublished());
        survey.setIsRequired(surveyDto.getIsRequired());
        survey.setTargetAudience(surveyDto.getTargetAudience());
        survey.setMaxResponses(surveyDto.getMaxResponses());
        
        // Anketi kaydet
        Survey updatedSurvey = surveyRepository.save(survey);
        
        return mapToSurveyDto(updatedSurvey);
    }
    
    @Override
    @Transactional
    public void deleteSurvey(Long id) {
        // Anketi bul
        Survey survey = surveyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Survey", "id", id));
        
        // Anketi sil (ilişkili sorular ve yanıtlar da cascade ile silinecek)
        surveyRepository.delete(survey);
    }
    
    @Override
    @Transactional
    public SurveyQuestionDto addQuestion(Long surveyId, SurveyQuestionDto questionDto) {
        // Anketi bul
        Survey survey = surveyRepository.findById(surveyId)
                .orElseThrow(() -> new ResourceNotFoundException("Survey", "id", surveyId));
        
        // Yeni soru oluştur
        SurveyQuestion question = new SurveyQuestion();
        question.setSurvey(survey);
        question.setQuestionText(questionDto.getQuestionText());
        question.setQuestionType(questionDto.getQuestionType());
        question.setOptions(questionDto.getOptions());
        question.setIsRequired(questionDto.getIsRequired());
        question.setOrderIndex(questionDto.getOrderIndex());
        question.setHint(questionDto.getHint());
        question.setValidationRegex(questionDto.getValidationRegex());
        question.setMinValue(questionDto.getMinValue());
        question.setMaxValue(questionDto.getMaxValue());
        
        // Soruyu kaydet
        SurveyQuestion savedQuestion = questionRepository.save(question);
        
        return mapToQuestionDto(savedQuestion);
    }
    
    @Override
    @Transactional
    public SurveyQuestionDto updateQuestion(Long questionId, SurveyQuestionDto questionDto) {
        // Soruyu bul
        SurveyQuestion question = questionRepository.findById(questionId)
                .orElseThrow(() -> new ResourceNotFoundException("SurveyQuestion", "id", questionId));
        
        // Soruyu güncelle
        question.setQuestionText(questionDto.getQuestionText());
        question.setQuestionType(questionDto.getQuestionType());
        question.setOptions(questionDto.getOptions());
        question.setIsRequired(questionDto.getIsRequired());
        question.setOrderIndex(questionDto.getOrderIndex());
        question.setHint(questionDto.getHint());
        question.setValidationRegex(questionDto.getValidationRegex());
        question.setMinValue(questionDto.getMinValue());
        question.setMaxValue(questionDto.getMaxValue());
        
        // Soruyu kaydet
        SurveyQuestion updatedQuestion = questionRepository.save(question);
        
        return mapToQuestionDto(updatedQuestion);
    }
    
    @Override
    @Transactional
    public void deleteQuestion(Long questionId) {
        // Soruyu bul
        SurveyQuestion question = questionRepository.findById(questionId)
                .orElseThrow(() -> new ResourceNotFoundException("SurveyQuestion", "id", questionId));
        
        // Soruyu sil (ilişkili yanıtlar da cascade ile silinecek)
        questionRepository.delete(question);
    }
    
    @Override
    @Transactional
    public SurveyResponseDto submitResponse(Long surveyId, SurveyResponseDto responseDto) {
        // Anketi ve soruyu bul
        Survey survey = surveyRepository.findById(surveyId)
                .orElseThrow(() -> new ResourceNotFoundException("Survey", "id", surveyId));
        
        SurveyQuestion question = questionRepository.findById(responseDto.getQuestionId())
                .orElseThrow(() -> new ResourceNotFoundException("SurveyQuestion", "id", responseDto.getQuestionId()));
        
        // Sorunun bu ankete ait olduğunu kontrol et
        if (!question.getSurvey().getId().equals(surveyId)) {
            throw new IllegalArgumentException("Soru verilen ankete ait değil");
        }
        
        // Yanıt oluştur
        SurveyResponse response = new SurveyResponse();
        response.setSurvey(survey);
        response.setQuestion(question);
        response.setResponseText(responseDto.getResponseText());
        response.setResponseValue(responseDto.getResponseValue());
        response.setSelectedOptions(responseDto.getSelectedOptions());
        response.setIpAddress(responseDto.getIpAddress());
        response.setUserAgent(responseDto.getUserAgent());
        
        // Kullanıcı veya anonim token ayarla
        if (responseDto.getUserId() != null) {
            User user = userRepository.findById(responseDto.getUserId())
                    .orElseThrow(() -> new ResourceNotFoundException("User", "id", responseDto.getUserId()));
            response.setUser(user);
        } else {
            response.setAnonymousUserToken(responseDto.getAnonymousUserToken());
        }
        
        // Yanıtı kaydet
        SurveyResponse savedResponse = responseRepository.save(response);
        
        // Anketin yanıt sayısını güncelle
        survey.setResponseCount(survey.getResponseCount() + 1);
        surveyRepository.save(survey);
        
        return mapToResponseDto(savedResponse);
    }
    
    @Override
    public List<SurveyResponseDto> getResponses(Long surveyId) {
        // Anketi bul
        surveyRepository.findById(surveyId)
                .orElseThrow(() -> new ResourceNotFoundException("Survey", "id", surveyId));
        
        // Ankete ait yanıtları getir
        List<SurveyResponse> responses = responseRepository.findBySurveyId(surveyId);
        
        return responses.stream()
                .map(this::mapToResponseDto)
                .collect(Collectors.toList());
    }
    
    @Override
    public Map<String, Object> analyzeResults(Long surveyId) {
        // Anketi bul
        Survey survey = surveyRepository.findById(surveyId)
                .orElseThrow(() -> new ResourceNotFoundException("Survey", "id", surveyId));
        
        // Sorulara göre yanıtları gruplandır
        List<SurveyQuestion> questions = new ArrayList<>(survey.getQuestions());
        Map<String, Object> results = new HashMap<>();
        
        // Genel istatistikler
        results.put("surveyTitle", survey.getTitle());
        results.put("totalResponses", survey.getResponseCount());
        results.put("questionCount", questions.size());
        
        // Her soru için analiz bilgisi oluştur
        List<Map<String, Object>> questionResults = new ArrayList<>();
        
        for (SurveyQuestion question : questions) {
            Map<String, Object> questionResult = new HashMap<>();
            questionResult.put("questionId", question.getId());
            questionResult.put("questionText", question.getQuestionText());
            questionResult.put("questionType", question.getQuestionType());
            
            // Soruya özel analiz
            List<SurveyResponse> questionResponses = responseRepository.findByQuestionId(question.getId());
            
            switch (question.getQuestionType()) {
                case SINGLE_CHOICE, MULTIPLE_CHOICE, DROPDOWN -> {
                    // Seçimler için frekans dağılımı
                    Map<String, Integer> optionFrequency = new HashMap<>();
                    
                    for (SurveyResponse response : questionResponses) {
                        if (response.getSelectedOptions() != null) {
                            String[] options = response.getSelectedOptions().split(",");
                            for (String option : options) {
                                optionFrequency.put(option.trim(), optionFrequency.getOrDefault(option.trim(), 0) + 1);
                            }
                        }
                    }
                    
                    questionResult.put("optionFrequency", optionFrequency);
                    questionResult.put("responseCount", questionResponses.size());
                }
                case RATING, SCALE, NUMBER -> {
                    // Sayısal değerler için istatistikler
                    double sum = 0;
                    double min = Double.MAX_VALUE;
                    double max = Double.MIN_VALUE;
                    int count = 0;
                    
                    for (SurveyResponse response : questionResponses) {
                        if (response.getResponseValue() != null) {
                            sum += response.getResponseValue();
                            min = Math.min(min, response.getResponseValue());
                            max = Math.max(max, response.getResponseValue());
                            count++;
                        }
                    }
                    
                    double average = count > 0 ? sum / count : 0;
                    
                    questionResult.put("averageValue", average);
                    questionResult.put("minValue", count > 0 ? min : null);
                    questionResult.put("maxValue", count > 0 ? max : null);
                    questionResult.put("responseCount", count);
                }
                default -> {
                    // Metin yanıtları için temel bilgiler
                    questionResult.put("responseCount", questionResponses.size());
                    
                    // Metin yanıtlarının listesini ekle (opsiyonel)
                    if (questionResponses.size() > 0) {
                        List<String> textResponses = questionResponses.stream()
                                .filter(r -> r.getResponseText() != null && !r.getResponseText().isEmpty())
                                .map(SurveyResponse::getResponseText)
                                .collect(Collectors.toList());
                        questionResult.put("textResponses", textResponses);
                    }
                }
            }
            
            questionResults.add(questionResult);
        }
        
        results.put("questions", questionResults);
        
        return results;
    }
    
    @Override
    public boolean isSurveyCreatedByUser(Long userId, Long surveyId) {
        Survey survey = surveyRepository.findById(surveyId)
                .orElseThrow(() -> new ResourceNotFoundException("Survey", "id", surveyId));
        
        return survey.getCreatedBy().getId().equals(userId);
    }
    
    @Override
    public boolean isQuestionInSurveyCreatedByUser(Long userId, Long questionId) {
        SurveyQuestion question = questionRepository.findById(questionId)
                .orElseThrow(() -> new ResourceNotFoundException("SurveyQuestion", "id", questionId));
        
        return question.getSurvey().getCreatedBy().getId().equals(userId);
    }
    
    // Entity'den DTO'ya dönüşüm metodları
    private SurveyDto mapToSurveyDto(Survey survey) {
        SurveyDto dto = modelMapper.map(survey, SurveyDto.class);
        
        // İlişkili entity'lerin bilgilerini ayarla
        if (survey.getClub() != null) {
            dto.setClubId(survey.getClub().getId());
            dto.setClubName(survey.getClub().getName());
        }
        
        if (survey.getEvent() != null) {
            dto.setEventId(survey.getEvent().getId());
            dto.setEventTitle(survey.getEvent().getTitle());
        }
        
        if (survey.getCreatedBy() != null) {
            dto.setCreatedById(survey.getCreatedBy().getId());
            dto.setCreatedByName(survey.getCreatedBy().getFullName());
        }
        
        // Aktif olma durumunu kontrol et
        LocalDateTime now = LocalDateTime.now();
        boolean isActive = (survey.getStartDate() == null || survey.getStartDate().isBefore(now))
                && (survey.getEndDate() == null || survey.getEndDate().isAfter(now))
                && Boolean.TRUE.equals(survey.getIsPublished());
        dto.setActive(isActive);
        
        return dto;
    }
    
    private SurveyQuestionDto mapToQuestionDto(SurveyQuestion question) {
        SurveyQuestionDto dto = modelMapper.map(question, SurveyQuestionDto.class);
        dto.setSurveyId(question.getSurvey().getId());
        return dto;
    }
    
    private SurveyResponseDto mapToResponseDto(SurveyResponse response) {
        SurveyResponseDto dto = modelMapper.map(response, SurveyResponseDto.class);
        
        dto.setSurveyId(response.getSurvey().getId());
        dto.setQuestionId(response.getQuestion().getId());
        
        if (response.getUser() != null) {
            dto.setUserId(response.getUser().getId());
            dto.setUserName(response.getUser().getFullName());
        }
        
        return dto;
    }
} 