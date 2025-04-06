package com.example.cmManagementSystem.service.impl;

import com.example.cmManagementSystem.dto.NotificationDto;
import com.example.cmManagementSystem.entity.Notification;
import com.example.cmManagementSystem.entity.User;
import com.example.cmManagementSystem.repository.NotificationRepository;
import com.example.cmManagementSystem.repository.UserRepository;
import com.example.cmManagementSystem.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class NotificationServiceImpl implements NotificationService {
    
    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    
    @Override
    @Transactional
    public NotificationDto createNotification(String title, String message, String type, Long entityId, Long userId, String data) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Kullanıcı bulunamadı"));
        
        Notification notification = Notification.builder()
                .title(title)
                .message(message)
                .type(type)
                .user(user)
                .entityId(entityId)
                .data(data)
                .isRead(false)
                .createdAt(LocalDateTime.now())
                .build();
        
        Notification savedNotification = notificationRepository.save(notification);
        
        return mapToDto(savedNotification);
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<NotificationDto> getUserNotifications(Long userId) {
        // PageRequest ile ilk 100 bildirimi alıyoruz, ihtiyaca göre ayarlanabilir
        List<Notification> notifications = notificationRepository.findByUserIdOrderByCreatedAtDesc(
                userId, 
                PageRequest.of(0, 100, Sort.by(Sort.Direction.DESC, "createdAt"))
        ).getContent();
        
        return notifications.stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }
    
    @Override
    @Transactional(readOnly = true)
    public int getUnreadNotificationCount(Long userId) {
        return notificationRepository.countUnreadByUserId(userId);
    }
    
    @Override
    @Transactional
    public NotificationDto markNotificationAsRead(Long notificationId, Long userId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Bildirim bulunamadı"));
        
        if (!notification.getUser().getId().equals(userId)) {
            throw new RuntimeException("Bu bildirimi işaretleme yetkiniz yok");
        }
        
        notification.setRead(true);
        notification.setReadAt(LocalDateTime.now());
        Notification updatedNotification = notificationRepository.save(notification);
        
        return mapToDto(updatedNotification);
    }
    
    @Override
    @Transactional
    public int markAllNotificationsAsRead(Long userId) {
        LocalDateTime now = LocalDateTime.now();
        notificationRepository.markAllAsRead(userId, now);
        return notificationRepository.countUnreadByUserId(userId);
    }
    
    @Override
    @Transactional
    public void deleteNotification(Long notificationId, Long userId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Bildirim bulunamadı"));
        
        if (!notification.getUser().getId().equals(userId)) {
            throw new RuntimeException("Bu bildirimi silme yetkiniz yok");
        }
        
        notificationRepository.delete(notification);
    }
    
    private NotificationDto mapToDto(Notification notification) {
        return NotificationDto.builder()
                .id(notification.getId())
                .title(notification.getTitle())
                .message(notification.getMessage())
                .type(notification.getType())
                .userId(notification.getUser().getId())
                .entityId(notification.getEntityId())
                .entityName(notification.getEntityName())
                .isRead(notification.isRead())
                .createdAt(notification.getCreatedAt())
                .readAt(notification.getReadAt())
                .data(notification.getData())
                .actionUrl(notification.getActionUrl())
                .build();
    }
} 