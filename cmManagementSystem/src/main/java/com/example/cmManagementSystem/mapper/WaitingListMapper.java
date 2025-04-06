package com.example.cmManagementSystem.mapper;

import com.example.cmManagementSystem.dto.WaitingListDto;
import com.example.cmManagementSystem.entity.Event;
import com.example.cmManagementSystem.entity.User;
import com.example.cmManagementSystem.entity.WaitingList;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class WaitingListMapper {
    
    /**
     * WaitingList entity'sini WaitingListDto'ya dönüştürür
     *
     * @param waitingList WaitingList entity
     * @return WaitingListDto
     */
    public WaitingListDto toDto(WaitingList waitingList) {
        if (waitingList == null) {
            return null;
        }
        
        WaitingListDto dto = new WaitingListDto();
        dto.setId(waitingList.getId());
        
        if (waitingList.getEvent() != null) {
            dto.setEventId(waitingList.getEvent().getId());
            dto.setEventTitle(waitingList.getEvent().getTitle());
        }
        
        if (waitingList.getUser() != null) {
            dto.setUserId(waitingList.getUser().getId());
            dto.setUserName(waitingList.getUser().getName());
            dto.setUserEmail(waitingList.getUser().getEmail());
        }
        
        dto.setJoinDate(waitingList.getJoinDate());
        dto.setPosition(waitingList.getPosition());
        dto.setNotificationSent(waitingList.getNotificationSent());
        dto.setNotificationDate(waitingList.getNotificationDate());
        dto.setStatus(waitingList.getStatus());
        dto.setResponseDeadline(waitingList.getResponseDeadline());
        dto.setResponseDate(waitingList.getResponseDate());
        dto.setNotes(waitingList.getNotes());
        dto.setCreatedAt(waitingList.getCreatedAt());
        dto.setUpdatedAt(waitingList.getUpdatedAt());
        
        return dto;
    }
    
    /**
     * WaitingList entity listesini WaitingListDto listesine dönüştürür
     *
     * @param waitingLists WaitingList entity listesi
     * @return WaitingListDto listesi
     */
    public List<WaitingListDto> toDtoList(List<WaitingList> waitingLists) {
        if (waitingLists == null) {
            return null;
        }
        
        return waitingLists.stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }
    
    /**
     * WaitingListDto'yu WaitingList entity'sine dönüştürür
     * Not: Event ve User referansları null olacaktır, bunların ayrıca ayarlanması gerekir
     *
     * @param dto WaitingListDto
     * @return WaitingList entity
     */
    public WaitingList toEntity(WaitingListDto dto) {
        if (dto == null) {
            return null;
        }
        
        WaitingList waitingList = new WaitingList();
        waitingList.setId(dto.getId());
        waitingList.setJoinDate(dto.getJoinDate() != null ? dto.getJoinDate() : LocalDateTime.now());
        waitingList.setPosition(dto.getPosition());
        waitingList.setNotificationSent(dto.getNotificationSent() != null ? dto.getNotificationSent() : false);
        waitingList.setNotificationDate(dto.getNotificationDate());
        waitingList.setStatus(dto.getStatus() != null ? dto.getStatus() : WaitingList.WaitingStatus.WAITING);
        waitingList.setResponseDeadline(dto.getResponseDeadline());
        waitingList.setResponseDate(dto.getResponseDate());
        waitingList.setNotes(dto.getNotes());
        
        return waitingList;
    }
    
    /**
     * WaitingListDto'yu mevcut bir WaitingList entity'sine kopyalar
     *
     * @param dto WaitingListDto
     * @param waitingList Hedef WaitingList entity
     */
    public void updateEntityFromDto(WaitingListDto dto, WaitingList waitingList) {
        if (dto == null || waitingList == null) {
            return;
        }
        
        if (dto.getPosition() != null) {
            waitingList.setPosition(dto.getPosition());
        }
        
        if (dto.getNotificationSent() != null) {
            waitingList.setNotificationSent(dto.getNotificationSent());
        }
        
        if (dto.getNotificationDate() != null) {
            waitingList.setNotificationDate(dto.getNotificationDate());
        }
        
        if (dto.getStatus() != null) {
            waitingList.setStatus(dto.getStatus());
        }
        
        if (dto.getResponseDeadline() != null) {
            waitingList.setResponseDeadline(dto.getResponseDeadline());
        }
        
        if (dto.getResponseDate() != null) {
            waitingList.setResponseDate(dto.getResponseDate());
        }
        
        if (dto.getNotes() != null) {
            waitingList.setNotes(dto.getNotes());
        }
    }
    
    /**
     * WaitingListDto'yu WaitingList entity'ye dönüştürür (Event ve User ile birlikte)
     *
     * @param dto WaitingListDto
     * @param event Event entity
     * @param user User entity
     * @return WaitingList entity
     */
    public WaitingList toEntity(WaitingListDto dto, Event event, User user) {
        WaitingList waitingList = toEntity(dto);
        
        if (waitingList != null) {
            waitingList.setEvent(event);
            waitingList.setUser(user);
        }
        
        return waitingList;
    }
} 