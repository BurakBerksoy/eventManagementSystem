package com.example.cmManagementSystem.controller;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Arrays;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/test")
@CrossOrigin(origins = "*")
public class TestController {

    @GetMapping("/users")
    public List<Map<String, Object>> getDummyUsers() {
        return Arrays.asList(
            Map.of(
                "id", 1,
                "name", "Test Kullanıcı 1",
                "email", "test1@example.com",
                "studentId", "20230001",
                "department", "Bilgisayar Mühendisliği"
            ),
            Map.of(
                "id", 2,
                "name", "Test Kullanıcı 2",
                "email", "test2@example.com",
                "studentId", "20230002",
                "department", "Elektrik-Elektronik Mühendisliği"
            ),
            Map.of(
                "id", 3,
                "name", "Test Kullanıcı 3",
                "email", "test3@example.com",
                "studentId", "20230003",
                "department", "Makine Mühendisliği"
            )
        );
    }
} 