package com.example.cmManagementSystem.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "survey_questions")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SurveyQuestion {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "survey_id", nullable = false)
    private Survey survey;
    
    @Column(name = "question_text", nullable = false, length = 1000)
    private String questionText;
    
    @Column(name = "question_type", nullable = false)
    @Enumerated(EnumType.STRING)
    private QuestionType questionType;
    
    @Column(name = "options", length = 2000)
    private String options;
    
    @Column(name = "is_required")
    private Boolean isRequired = false;
    
    @Column(name = "order_index")
    private Integer orderIndex;
    
    @Column(name = "hint", length = 500)
    private String hint;
    
    @Column(name = "validation_regex")
    private String validationRegex;
    
    @Column(name = "min_value")
    private Integer minValue;
    
    @Column(name = "max_value")
    private Integer maxValue;
    
    @OneToMany(mappedBy = "question", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<SurveyResponse> responses = new HashSet<>();
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    // İlk oluşturma zamanını ayarla
    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        if (this.questionType == null) {
            this.questionType = QuestionType.TEXT;
        }
    }
    
    // Güncelleme zamanını ayarla
    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
    
    // Soru tipi
    public enum QuestionType {
        TEXT,                // Metin
        TEXTAREA,            // Uzun metin
        SINGLE_CHOICE,       // Tek seçim
        MULTIPLE_CHOICE,     // Çoklu seçim
        DROPDOWN,            // Açılır menü
        RATING,              // Derecelendirme
        SCALE,               // Ölçek
        DATE,                // Tarih
        TIME,                // Zaman
        EMAIL,               // E-posta
        PHONE,               // Telefon
        NUMBER,              // Sayı
        FILE_UPLOAD          // Dosya yükleme
    }
} 