package com.bookbridge.service;

import com.bookbridge.dto.ActiveSessionDto;
import com.bookbridge.dto.AuthResponse;
import com.bookbridge.dto.LoginRequest;
import com.bookbridge.dto.RegisterRequest;
import com.bookbridge.entity.User;
import com.bookbridge.exception.BadRequestException;
import com.bookbridge.exception.UnauthorizedException;
import com.bookbridge.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.concurrent.atomic.AtomicReference;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    // Single active login tracker (Thread-safe)
    private final AtomicReference<ActiveSession> currentActiveSession = new AtomicReference<>(null);

    public static class ActiveSession {
        private final Long userId;
        private final String userName;
        private final String email;
        private final String token;
        private final LocalDateTime loginTime;

        public ActiveSession(Long userId, String userName, String email, String token, LocalDateTime loginTime) {
            this.userId = userId;
            this.userName = userName;
            this.email = email;
            this.token = token;
            this.loginTime = loginTime;
        }

        public Long getUserId() { return userId; }
        public String getUserName() { return userName; }
        public String getEmail() { return email; }
        public String getToken() { return token; }
        public LocalDateTime getLoginTime() { return loginTime; }
    }

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("An account with email " + request.getEmail() + " already exists");
        }

        User user = new User();
        user.setName(request.getName().trim());
        user.setEmail(request.getEmail().trim().toLowerCase());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setPhone(request.getPhone());
        user.setLocation(request.getLocation());

        User savedUser = userRepository.save(user);

        return new AuthResponse(
                null,
                savedUser.getId(),
                savedUser.getName(),
                savedUser.getEmail(),
                savedUser.getPhone(),
                savedUser.getLocation(),
                "Account registered successfully. Please log in."
        );
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail().trim().toLowerCase())
                .orElseThrow(() -> new UnauthorizedException("Invalid email or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new UnauthorizedException("Invalid email or password");
        }

        // ENFORCE SINGLE ACTIVE LOGIN:
        // Check if someone else is currently logged in
        ActiveSession active = currentActiveSession.get();
        if (active != null && !active.getUserId().equals(user.getId()) && !request.isForce()) {
            throw new BadRequestException(
                "Another user (" + active.getUserName() + " <" + active.getEmail() + ">) is currently logged in. " +
                "Only one user can be logged in at a time. Please wait for them to log out, or log out the active session."
            );
        }

        // Generate token and assign as the sole active session
        String token = "bb-token-" + user.getId() + "-" + System.currentTimeMillis();
        ActiveSession newSession = new ActiveSession(user.getId(), user.getName(), user.getEmail(), token, LocalDateTime.now());
        currentActiveSession.set(newSession);

        return new AuthResponse(
                token,
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getPhone(),
                user.getLocation(),
                "Login successful"
        );
    }

    public void logout(Long userId) {
        ActiveSession active = currentActiveSession.get();
        if (active != null) {
            if (userId == null || active.getUserId().equals(userId)) {
                currentActiveSession.set(null);
            }
        }
    }

    public ActiveSessionDto getActiveSession() {
        ActiveSession active = currentActiveSession.get();
        if (active == null) {
            return new ActiveSessionDto();
        }
        return new ActiveSessionDto(active.getUserId(), active.getUserName(), active.getEmail(), active.getLoginTime());
    }
}
