package com.bookbridge.controller;

import com.bookbridge.dto.ActiveSessionDto;
import com.bookbridge.dto.ApiResponse;
import com.bookbridge.dto.AuthResponse;
import com.bookbridge.dto.LoginRequest;
import com.bookbridge.dto.RegisterRequest;
import com.bookbridge.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        AuthResponse response = authService.register(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse> logout(@RequestParam(required = false) Long userId) {
        authService.logout(userId);
        return ResponseEntity.ok(new ApiResponse(true, "Logged out successfully"));
    }

    @GetMapping("/session")
    public ResponseEntity<ActiveSessionDto> getActiveSession() {
        return ResponseEntity.ok(authService.getActiveSession());
    }
}
