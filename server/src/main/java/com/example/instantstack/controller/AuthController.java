package com.example.instantstack.controller;

import com.example.instantstack.dto.LoginRequest;
import com.example.instantstack.service.AppUserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("/api/auth")
public class AuthController {
    @Autowired
    private AppUserService appUserService;

    @PostMapping("/login")
    public ResponseEntity<String> login(@RequestBody LoginRequest request){
        String token = appUserService.login(request);
        return ResponseEntity.ok(token);
    }
}
