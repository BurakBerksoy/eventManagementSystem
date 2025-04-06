package com.example.cmManagementSystem.dto;

import com.example.cmManagementSystem.entity.NotificationPreference;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.time.LocalTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationPreferenceDto {
    
    private Long id;
    
    @NotNull(message = "Kullanıcı ID zorunludur")
    private Long userId;
    
    private String userEmail;
    
    private Boolean emailEnabled;
    
    private Boolean systemEnabled;
    
    private Boolean smsEnabled;
    
    private NotificationPreference.NotificationFrequency emailFrequency;
    
    private NotificationPreference.NotificationFrequency systemFrequency;
    
    private NotificationPreference.NotificationFrequency smsFrequency;
    
    private Integer eventReminderDays;
    
    private LocalTime quietHoursStart;
    
    private LocalTime quietHoursEnd;
    
    private Boolean quietHoursEnabled;
    
    private Boolean eventRemindersEnabled;
    
    private Boolean clubAnnouncementsEnabled;
    
    private Boolean membershipUpdatesEnabled;
    
    private Boolean certificateNotificationsEnabled;
    
    private Boolean systemAnnouncementsEnabled;
    
    private Boolean marketingEmailsEnabled;
    
    private LocalDateTime createdAt;
    
    private LocalDateTime updatedAt;
} 