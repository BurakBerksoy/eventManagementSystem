package com.example.cmManagementSystem.repository;

import com.example.cmManagementSystem.entity.SurveyQuestion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SurveyQuestionRepository extends JpaRepository<SurveyQuestion, Long> {
    
    List<SurveyQuestion> findBySurveyId(Long surveyId);
    
    List<SurveyQuestion> findBySurveyIdOrderByOrderIndexAsc(Long surveyId);
    
    List<SurveyQuestion> findByQuestionType(SurveyQuestion.QuestionType questionType);
    
    List<SurveyQuestion> findBySurveyIdAndIsRequired(Long surveyId, Boolean isRequired);
} 