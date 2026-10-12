package com.bookbridge.dto;

import com.bookbridge.entity.BookCondition;
import com.bookbridge.entity.BookStatus;
import com.bookbridge.entity.Genre;
import jakarta.validation.constraints.NotNull;

public class BookUpdateRequest {

    private String title;
    private String author;
    private Genre genre;
    private BookCondition condition;
    private String description;
    private String location;
    private BookStatus status;

    @NotNull(message = "Owner ID is required to verify authorization")
    private Long ownerId;

    public BookUpdateRequest() {}

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getAuthor() {
        return author;
    }

    public void setAuthor(String author) {
        this.author = author;
    }

    public Genre getGenre() {
        return genre;
    }

    public void setGenre(Genre genre) {
        this.genre = genre;
    }

    public BookCondition getCondition() {
        return condition;
    }

    public void setCondition(BookCondition condition) {
        this.condition = condition;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public BookStatus getStatus() {
        return status;
    }

    public void setStatus(BookStatus status) {
        this.status = status;
    }

    public Long getOwnerId() {
        return ownerId;
    }

    public void setOwnerId(Long ownerId) {
        this.ownerId = ownerId;
    }
}
