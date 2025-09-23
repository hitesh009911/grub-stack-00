package com.grubstack.admin.web;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
public class HomeController {
    
    @GetMapping("/")
    public Map<String, String> home() {
        return Map.of(
            "service", "Admin Service", 
            "status", "running", 
            "version", "1.0.0",
            "endpoints", "/admin/*"
        );
    }
    
    @GetMapping("/health")
    public Map<String, String> health() {
        return Map.of("status", "UP", "service", "admin-service");
    }
}
