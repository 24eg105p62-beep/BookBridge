package com.bookbridge.dto;

import java.time.LocalDateTime;

public class ActiveSessionDto {

    private boolean active;
    private Long userId;
    private String userName;
    private String email;
    private LocalDateTime loginTime;

    public ActiveSessionDto() {
        this.active = false;
    }

    public ActiveSessionDto(Long userId, String userName, String email, LocalDateTime loginTime) {
        this.active = true;
        this.userId = userId;
        this.userName = userName;
        this.email = email;
        this.loginTime = loginTime;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getUserName() {
        return userName;
    }

    public void setUserName(String userName) {
        this.userName = userName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public LocalDateTime getLoginTime() {
        return loginTime;
    }

    public void setLoginTime(LocalDateTime loginTime) {
        this.loginTime = loginTime;
    }
}
