package com.example.cmManagementSystem.repository;

import com.example.cmManagementSystem.entity.SurveyResponse;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SurveyResponseRepository extends JpaRepository<SurveyResponse, Long> {
    
    List<SurveyResponse> findBySurveyId(Long surveyId);
    
    List<SurveyResponse> findByQuestionId(Long questionId);
    
    List<SurveyResponse> findByUserId(Long userId);
    
    List<SurveyResponse> findBySurveyIdAndUserId(Long surveyId, Long userId);
    
    List<SurveyResponse> findBySurveyIdAndAnonymousUserToken(Long surveyId, String anonymousUserToken);
    
    @Query("SELECT COUNT(DISTINCT sr.user.id) FROM SurveyResponse sr WHERE sr.survey.id = ?1")
    Integer countUniqueRespondentsBySurveyId(Long surveyId);
    
    @Query("SELECT COUNT(DISTINCT sr.anonymousUserToken) FROM SurveyResponse sr WHERE sr.survey.id = ?1 AND sr.anonymousUserToken IS NOT NULL")
    Integer countUniqueAnonymousRespondentsBySurveyId(Long surveyId);
    
    @Query("SELECT AVG(sr.responseValue) FROM SurveyResponse sr WHERE sr.question.id = ?1")
    Double getAverageRatingForQuestion(Long questionId);
} 