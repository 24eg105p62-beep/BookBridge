package com.bookbridge.dto;

import com.bookbridge.entity.BookCondition;
import com.bookbridge.entity.Genre;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class BookCreateRequest {

    @NotBlank(message = "Title is required")
    private String title;

    @NotBlank(message = "Author is required")
    private String author;

    @NotNull(message = "Genre is required")
    private Genre genre;

    @NotNull(message = "Condition is required")
    private BookCondition condition;

    private String description;

    private String location;

    @NotNull(message = "Owner ID is required")
    private Long ownerId;

    public BookCreateRequest() {}

    public BookCreateRequest(String title, String author, Genre genre, BookCondition condition, String description, String location, Long ownerId) {
        this.title = title;
        this.author = author;
        this.genre = genre;
        this.condition = condition;
        this.description = description;
        this.location = location;
        this.ownerId = ownerId;
    }

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

    public Long getOwnerId() {
        return ownerId;
    }

    public void setOwnerId(Long ownerId) {
        this.ownerId = ownerId;
    }
}
