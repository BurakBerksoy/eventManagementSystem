package com.example.cmManagementSystem.controller;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/cors")
@CrossOrigin(origins = "http://localhost:5173", maxAge = 3600)
public class CorsController {

    @GetMapping("/check")
    public String checkCors() {
        return "CORS is working!";
    }

} 