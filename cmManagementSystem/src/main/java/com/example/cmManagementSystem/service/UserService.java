package com.example.cmManagementSystem.service;

import com.example.cmManagementSystem.dto.UserDto;
import com.example.cmManagementSystem.entity.User;

import java.util.List;

public interface UserService {
    
    UserDto findById(Long id);
    
    UserDto findByEmail(String email);
    
    UserDto findByStudentId(String studentId);
    
    List<UserDto> findAll();
    
    UserDto createUser(UserDto userDto);
    
    UserDto updateUser(Long id, UserDto userDto);
    
    UserDto updateProfile(Long id, UserDto userDto);
    
    void deleteUser(Long id);
    
    boolean existsByEmail(String email);
    
    boolean existsByStudentId(String studentId);
    
    User getCurrentUser();
} 